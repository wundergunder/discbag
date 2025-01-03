import { CreateListingForm } from "../components/marketplace/CreateListingForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/auth/AuthProvider";

export function CreateListingPage() {
	const navigate = useNavigate();
	const { user } = useAuth();

	const handleSuccess = () => {
		navigate("/marketplace");
	};

	return (
		<div className="max-w-3xl mx-auto">
			<h1 className="text-3xl font-bold mb-8">Create Listing</h1>
			<CreateListingForm userId={user?.id} onSuccess={handleSuccess} />
		</div>
	);
}
