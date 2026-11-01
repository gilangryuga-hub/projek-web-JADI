from django.contrib.auth.models import User
from .models import UserProfile
from rest_framework import serializers  

class UserProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(
        source='avatar_url',
        write_only=True,
        required=False,
    )

    class Meta:
        model = UserProfile
        fields = ['bio', 'avatar_url', 'avatar']
        read_only_fields = ['avatar_url']

    def validate_avatar(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Ukuran foto maksimal 5 MB.")
        return value

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']

class RegisterSerializer (serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username= validated_data['username'],
            email= validated_data.get('email', ''),
            password= validated_data['password']
        )
        UserProfile.objects.create(user=user)
        return user