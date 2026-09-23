import {
  CodeFormValues,
  codeSchema,
  SignUpFormSchema,
  signUpSchema,
} from "@/schemas/auth";
import { useAuth, useSignUp } from "@clerk/expo";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SignUpScreen = () => {
  const { errors, fetchStatus, signUp } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const {
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<SignUpFormSchema>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });

  const {
    control: codeControl,
    handleSubmit: handleCodeSubmit,
    formState: { errors: codeErrors },
  } = useForm<CodeFormValues>({
    resolver: zodResolver(codeSchema),
    mode: "onBlur",
    defaultValues: { code: "" },
  });

  const isLoading = fetchStatus === "fetching";

  const onSignUpPress = async (values: SignUpFormSchema) => {
    setEmail(values.email);

    const { error } = await signUp.password({
      emailAddress: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
    });

    if (error) {
      console.error(JSON.stringify(error.message, null, 2));
      return;
    }

    if (!error) await signUp.verifications.sendEmailCode();
  };

  const onVerifyPress = async ({ code }: { code: string }) => {
    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    } else {
      console.error(`Sign-up attempt not complete: ${signUp}`);
    }
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="bg-brand-body flex-1"
      >
        <View className="flex-1 justify-center px-6 -mt-16">
          <Text className="text-3xl font-bold text-[#1A1D26] mb-2 leading-tight ">
            Verify your account.
          </Text>

          <Text className="text-brand-text-muted text-base mb-8">
            We sent a code to {email}
          </Text>
          <Controller
            control={codeControl}
            name="code"
            render={({ field: { value, onChange } }) => {
              return (
                <TextInput
                  className="border border-[#E8E6DF] text-[#1A1D26] rounded-xl px-4 py-3 bg-white mb-2"
                  placeholder="Enter Verification Code"
                  placeholderTextColor="#8a8d96"
                  value={value}
                  onChangeText={onChange}
                />
              );
            }}
          />
          {codeErrors.code && (
            <Text className="text-brand-coral mb-4 text-sm">
              {codeErrors.code.message}
            </Text>
          )}

          {errors.fields.code && (
            <Text className="text-brand-coral mb-4 text-sm">
              {errors.fields.code.message}
            </Text>
          )}

          <TouchableOpacity
            className="w-full bg-brand-blue py-4 rounded-xl items-center mb-4"
            onPress={handleCodeSubmit(onVerifyPress)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">Verify</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => signUp.verifications.sendEmailCode()}
            className="py-2"
          >
            <Text className="text-brand-blue text-sm">I need a new code</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => signUp.reset()} className="py-2">
            <Text className="text-brand-blue text-sm">Start over</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="bg-brand-body flex-1"
    >
      <View className="flex-1 justify-center px-6 -mt-16">
        <Image
          source={require("../../../assets/images/FullLogoDark.png")}
          className="w-36 h-16 mb-8"
          resizeMode="contain"
        />
        <Text className="text-3xl font-bold text-[#1A1D26] mb-2 leading-tight ">
          Create Account
        </Text>

        <Text className="text-brand-text-muted text-base mb-8">
          Tracking your money made easy with AI
        </Text>

        <View className="flex-row gap-3 mb-1">
          <Controller
            control={control}
            name="firstName"
            render={({ field: { value, onChange } }) => {
              return (
                <TextInput
                  className="flex-1 px-4 py-3 mb-2 bg-white rounded-xl border border-[#E8E6DF] text-[#1A1D26]"
                  placeholder="First Name"
                  placeholderTextColor="#8a8d96"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                />
              );
            }}
          />

          <Controller
            control={control}
            name="lastName"
            render={({ field: { value, onChange } }) => {
              return (
                <TextInput
                  className="flex-1 px-4 py-3 mb-2 bg-white rounded-xl border border-[#E8E6DF] text-[#1A1D26]"
                  placeholder="Last Name"
                  placeholderTextColor="#8a8d96"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="words"
                />
              );
            }}
          />
        </View>

        {(formErrors.firstName || formErrors.lastName) && (
          <Text className="text-brand-coral mb-4 text-sm">
            {formErrors.firstName?.message || formErrors.lastName?.message}
          </Text>
        )}

        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => {
            return (
              <TextInput
                className="px-4 py-3 mb-2 bg-white rounded-xl border border-[#E8E6DF] text-[#1A1D26]"
                placeholder="Email Address"
                placeholderTextColor="#8a8d96"
                value={value}
                onChangeText={onChange}
                autoCapitalize="words"
              />
            );
          }}
        />
        {formErrors.email && (
          <Text className="text-brand-coral mb-4 text-sm">
            {formErrors.email?.message}
          </Text>
        )}
        {errors.fields.emailAddress && (
          <Text className="text-brand-coral mb-4 text-sm">
            {errors.fields.emailAddress.message}
          </Text>
        )}

        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange } }) => {
            return (
              <TextInput
                className="px-4 py-3 mb-2 bg-white rounded-xl border border-[#E8E6DF] text-[#1A1D26]"
                placeholder="Password"
                placeholderTextColor="#8a8d96"
                value={value}
                onChangeText={onChange}
                autoCapitalize="words"
                secureTextEntry
              />
            );
          }}
        />
        {formErrors.password && (
          <Text className="text-brand-coral mb-4 text-sm">
            {formErrors.password?.message}
          </Text>
        )}
        {errors.fields.password && (
          <Text className="text-brand-coral mb-4 text-sm">
            {errors.fields.password.message}
          </Text>
        )}

        <TouchableOpacity
          className="w-full bg-brand-blue py-4 rounded-xl items-center mb-4"
          onPress={handleSubmit(onSignUpPress)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Sign Up</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center">
          <Text className="text-brand-text-muted">
            Already have an account?{" "}
            <Link href="/(auth)/sign-in">
              <Text className="text-brand-blue font-semibold">Sign in</Text>
            </Link>
          </Text>
        </View>

        <View nativeID="clerk-captcha" />
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;
