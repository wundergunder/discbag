import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle } from 'lucide-react';
import type { ConversationWithDetails } from '../../pages/MessagesPage';

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  loading: boolean;
  currentUserId: string | undefined;
}

export function ConversationList({ conversations, loading, currentUserId }: ConversationListProps) {
  if (loading) {
    return <div>Loading conversations...</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
        <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No messages</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start a conversation by contacting a seller in the marketplace.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => {
        const isCurrentUserBuyer = currentUserId === conversation.buyer_id;
        const otherUser = isCurrentUserBuyer ? conversation.seller : conversation.buyer;
        
        return (
          <Link
            key={conversation.id}
            to={`/messages/${conversation.id}`}
            className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {conversation.listing.disc.disc_model.manufacturer.name}{' '}
                    {conversation.listing.disc.disc_model.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isCurrentUserBuyer ? 'Seller' : 'Buyer'}: {otherUser.username}
                  </p>
                </div>
                {conversation.last_message && (
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                  </span>
                )}
              </div>
              {conversation.last_message && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {conversation.last_message.content}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}