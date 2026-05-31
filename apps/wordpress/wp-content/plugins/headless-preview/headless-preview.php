<?php
/**
 * Plugin Name: Headless Preview
 * Description: WordPress の下書きプレビューURLをNext.jsのDraft Mode URLに書き換える
 * Version: 1.0.0
 */

defined('ABSPATH') || exit;

add_filter('preview_post_link', function (string $link, WP_Post $post): string {
    $frontend_url = defined('HEADLESS_FRONTEND_URL')
        ? HEADLESS_FRONTEND_URL
        : (getenv('HEADLESS_FRONTEND_URL') ?: 'http://localhost:3000');

    $secret = defined('PREVIEW_SECRET')
        ? PREVIEW_SECRET
        : (getenv('PREVIEW_SECRET') ?: '');

    return add_query_arg(
        ['secret' => $secret, 'id' => $post->ID],
        trailingslashit($frontend_url) . 'api/draft'
    );
}, 10, 2);
