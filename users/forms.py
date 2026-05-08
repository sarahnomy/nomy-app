from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import ValidationError

class UserRegisterForm(UserCreationForm):
    email = forms.EmailField(
        label='Email',
        help_text="We’ll use this for account emails."
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

        labels = {
            "username": "Username",
            "password1": "Password",
            "password2": "Password confirmation",
        }
        # Replace the long, technical defaults with calm, short guidance
        help_texts = {
            "username": "Pick a simple name you’ll remember.",
            "password1": "At least 8 characters is enough.",
            "password2": "Type the same password again.",
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Remove Django’s long password rules list completely (frontend)
        self.fields["password1"].help_text = "At least 8 characters is enough."

        # Gentle error messages
        self.fields["username"].error_messages.update({
            "required": "Please choose a username.",
            "unique": "That name is taken. Try a small change.",
        })
        self.fields["email"].error_messages.update({
            "required": "Please enter your email.",
            "invalid": "That doesn’t look like an email address.",
        })
        self.fields["password2"].error_messages.update({
            "password_mismatch": "Those passwords don’t match.",
        })

        # Nice defaults for browsers & your NOMY CSS
        autocomplete = {
            "username": "username",
            "email": "email",
            "password1": "new-password",
            "password2": "new-password",
        }
        placeholders = {
            "username": "e.g. sarah_a",
            "email": "you@example.com",
        }
        for name, field in self.fields.items():
            if name in autocomplete:
                field.widget.attrs.setdefault("autocomplete", autocomplete[name])
            if name in placeholders:
                field.widget.attrs.setdefault("placeholder", placeholders[name])
            # optional: add a CSS hook if you want
            field.widget.attrs.setdefault("class", "nomy-input")

    # Make email unique (common expectation)
    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError("This email is already in use.")
        return email


class EmailVerificationLoginForm(AuthenticationForm):
    error_messages = {
        **AuthenticationForm.error_messages,
        "inactive": "Please verify your email before logging in.",
    }

    def clean(self):
        username = self.cleaned_data.get("username")
        password = self.cleaned_data.get("password")

        cleaned_data = super().clean()

        if username and password and self.user_cache is None:
            try:
                user = User.objects.get(username__iexact=username)
            except User.DoesNotExist:
                user = None

            if user is not None and not user.is_active and user.check_password(password):
                raise ValidationError(
                    self.error_messages["inactive"],
                    code="inactive",
                )

        return cleaned_data
