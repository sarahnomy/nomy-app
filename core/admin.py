from django.contrib import admin
from .models import Story, StoryReport, UserBlock


@admin.action(description="Publish selected stories after review")
def publish_stories(modeladmin, request, queryset):
    queryset.update(status="published")


@admin.action(description="Reject or remove selected stories")
def reject_stories(modeladmin, request, queryset):
    queryset.update(status="rejected")


@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("title", "body", "author__username")
    readonly_fields = ("id", "author", "client_id", "created_at")
    actions = (publish_stories, reject_stories)

    def get_readonly_fields(self, request, obj=None):
        # New admin-created stories need an author; existing ownership stays fixed.
        if obj is None:
            return tuple(field for field in self.readonly_fields if field != "author")
        return self.readonly_fields


@admin.action(description="Mark selected reports reviewed")
def mark_reviewed(modeladmin, request, queryset):
    queryset.update(reviewed=True)


@admin.register(StoryReport)
class StoryReportAdmin(admin.ModelAdmin):
    list_display = ("story", "reason", "reporter", "reviewed", "created_at")
    list_filter = ("reviewed", "reason", "created_at")
    readonly_fields = ("story", "reporter", "reason", "details", "created_at")
    actions = (mark_reviewed,)


@admin.register(UserBlock)
class UserBlockAdmin(admin.ModelAdmin):
    list_display = ("blocker", "blocked", "created_at")
    readonly_fields = ("blocker", "blocked", "created_at")
