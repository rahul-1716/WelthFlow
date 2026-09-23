import { useAuth, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { Alert, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileScreen = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-body" edges={["top"]}>
      <TouchableOpacity
        className="bg-brand-blue py-4 px-8 self-start rounded-xl"
        onPress={handleSignOut}
      >
        <Text className="text-white">Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ProfileScreen;
