from django.contrib import admin

from .models import ExpressAIUsage


@admin.register(ExpressAIUsage)
class ExpressAIUsageAdmin(admin.ModelAdmin):
    list_display = ("user", "flow_id", "used_at", "last_used_at", "request_count", "model", "input_tokens", "output_tokens")
    list_filter = ("model", "used_at")
    search_fields = ("user__username", "user__email", "flow_id")
