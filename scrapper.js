

export const youtubeScraper = async (apiKey, url, google) => {
    const youtube = google.youtube({ version: 'v3', auth: apiKey });

    let videoId;
    if (url.includes('youtu.be/')) {
        // Shortened YouTube URL
        videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/watch')) {
        // Regular YouTube URL
        videoId = new URL(url).searchParams.get('v');
    }

    if (videoId) {
        // Fetch video details
        const videoResponse = await youtube.videos.list({
            part: 'snippet,statistics',
            id: videoId
        });

        const videoData = videoResponse.data.items[0];

        // Fetch comments
        const commentsResponse = await youtube.commentThreads.list({
            part: 'snippet',
            videoId: videoId,
            maxResults: 50
        });

        const comments = commentsResponse.data.items.map(item => {
            const comment = item.snippet.topLevelComment.snippet;
            return {
                author: comment.authorDisplayName,
                text: comment.textOriginal,
                likes: comment.likeCount,
                publishedAt: comment.publishedAt
            };
        });

        return {
            video_details: {
                videoId: videoId,
                title: videoData.snippet.title,
                description: videoData.snippet.description,
                channel: videoData.snippet.channelTitle,
                views: videoData.statistics.viewCount,
                likes: videoData.statistics.likeCount,
                comments_count: videoData.statistics.commentCount
            },
            comments: comments
        };

    } else if (url.includes('youtube.com/channel') || url.includes('youtube.com/c/') || url.includes('youtube.com/@')) {
        // Channel URL
        let channelId;

        if (url.includes('youtube.com/@')) {
            const username = url.split('/@')[1];
            const searchResponse = await youtube.search.list({
                part: 'snippet',
                type: 'channel',
                q: username,
                maxResults: 1
            });

            if (searchResponse.data.items.length > 0) {
                channelId = searchResponse.data.items[0].id.channelId;
            }
        } else {
            channelId = url.split('/').pop();
        }

        if (!channelId) {
            return { error: 'Channel not found or invalid URL.' };
        }

        // Fetch channel details
        const channelResponse = await youtube.channels.list({
            part: 'snippet,statistics',
            id: channelId
        });

        const channelData = channelResponse.data.items[0];
        return {
            channel_details: {
                thumbnail: channelData.snippet.thumbnails.medium,
                title: channelData.snippet.title,
                description: channelData.snippet.description,
                subscribers: channelData.statistics.subscriberCount,
                videos: channelData.statistics.videoCount,
                views: channelData.statistics.viewCount,
                url: `https://www.youtube.com/channel/${channelId}`
            }
        };

    } else {
        return { error: 'Unsupported URL format. Please provide a valid YouTube video or channel URL.' };
    }
}