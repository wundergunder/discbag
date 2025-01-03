import { useState, useEffect } from "react";
import { ConversationList } from "../components/messages/ConversationList";
import { useAuth } from "../components/auth/AuthProvider";
import { supabase } from "../lib/supabase";
import type { Conversation } from "../types/database";

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
	last_message?: {
		content: string;
		created_at: string;
	};
}

export function MessagesPage() {
	const { user } = useAuth();
	const [conversations, setConversations] = useState<ConversationWithDetails[]>(
		[]
	);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadConversations() {
			if (!user) return;

			const { data, error } = await supabase
				.from("conversations")
				.select(
					`
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
          seller:seller_id (username),
          messages:messages (
            content,
            created_at
          )
        `
				)
				.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
				.order("updated_at", { ascending: false });

			if (error) {
				console.error("Error loading conversations:", error);
				return;
			}

			const conversationsWithLastMessage = data.map((conv) => ({
				...conv,
				last_message: conv.messages.sort(
					(a, b) =>
						new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
				)[0],
			}));

			setConversations(conversationsWithLastMessage);
			setLoading(false);
		}

		loadConversations();
	}, [user]);

	return (
		<div className="max-w-4xl mx-auto">
			<h1 className="text-3xl font-bold mb-8">Messages</h1>
			<ConversationList
				conversations={conversations}
				loading={loading}
				currentUserId={user?.id}
			/>
		</div>
	);
}
