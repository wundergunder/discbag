import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileForm } from "../components/profile/ProfileForm";
import { useAuth } from "../components/auth/AuthProvider";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types/database";

export function ProfilePage() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadProfile() {
			if (!user) return;

			const { data, error } = await supabase
				.from("profiles")
				.select("*")
				.eq("id", user.id)
				.single();

			if (error) {
				console.error("Error loading profile:", error);
				return;
			}

			setProfile(data);
			setLoading(false);
		}

		loadProfile();
	}, [user]);

	if (loading) {
		return <>Loading...</>;
	}

	return (
		<div className="max-w-2xl mx-auto">
			<h1 className="text-3xl font-bold mb-8">
				{profile ? "Edit Profile" : "Complete Your Profile"}
			</h1>
			<ProfileForm
				initialData={profile}
				onComplete={() => navigate("/dashboard")}
			/>
		</div>
	);
}
