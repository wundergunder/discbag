import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { MessageList } from '../components/messages/MessageList';
import { MessageInput } from '../components/messages/MessageInput';
import { useAuth } from '../components/auth/AuthProvider';
import { supabase } from '../lib/supabase';
import type { Message, Conversation } from '../types/database';

interface ConversationWithDetails extends Conversation {
  listing: {
    disc: {
      disc_model: {
        name: string;
        manufacturer: {
          name: string;
        };
      };
    };
  };
  buyer: {
    username: string;
  };
  seller: {
    username: string;
  };
}

export function ConversationPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function loadConversation() {
      if (!conversationId || !user) return;

      const [conversationResponse, messagesResponse] = await Promise.all([
        supabase
          .from('conversations')
          .select(`
            *,
            listing:listing_id (
              disc:disc_id (
                disc_model:disc_model_id (
                  name,
                  manufacturer:manufacturer_id (name)
                )
              )
            ),
            buyer:buyer_id (username),
            seller:seller_id (username)
          `)
          .eq('id', conversationId)
          .single(),
        supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true }),
      ]);

      if (conversationResponse.error || messagesResponse.error) {
        console.error('Error loading conversation:', 
          conversationResponse.error || messagesResponse.error
        );
        return;
      }

      setConversation(conversationResponse.data);
      setMessages(messagesResponse.data || []);
      setLoading(false);
    }

    loadConversation();

    // Set up real-time subscription
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, user]);

  const handleSendMessage = async (content: string) => {
    if (!user || !conversation) return;

    setSending(true);
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        content,
      });

    if (error) {
      console.error('Error sending message:', error);
    }
    setSending(false);
  };

  if (loading) {
    return <Layout>Loading conversation...</Layout>;
  }

  if (!conversation) {
    return <Layout>Conversation not found</Layout>;
  }

  const otherUser = user?.id === conversation.buyer_id
    ? conversation.seller
    : conversation.buyer;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-12rem)]">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-medium">
              {conversation.listing.disc.disc_model.manufacturer.name}{' '}
              {conversation.listing.disc.disc_model.name}
            </h2>
            <p className="text-sm text-gray-600">
              Chatting with {otherUser.username}
            </p>
          </div>

          <div className="flex flex-col h-[calc(100%-4rem)]">
            <MessageList messages={messages} currentUserId={user?.id} />
            <MessageInput onSend={handleSendMessage} loading={sending} />
          </div>
        </div>
      </div>
    </Layout>
  );
}