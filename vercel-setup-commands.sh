# Set WebSocket environment variables in Vercel
vercel env add NEXT_PUBLIC_WS_URL production
# When prompted, enter: https://xcyrexmwrwjq.ap-southeast-1.clawcloudrun.com

vercel env add NEXT_PUBLIC_SOCKETIO_URL production
# When prompted, enter: https://xcyrexmwrwjq.ap-southeast-1.clawcloudrun.com

vercel env add NEXT_PUBLIC_USE_SOCKETIO production
# When prompted, enter: true

vercel env add NEXT_PUBLIC_ENABLE_FALLBACK production
# When prompted, enter: true

vercel env add NEXT_PUBLIC_POLLING_ENABLED production
# When prompted, enter: true

# Deploy with new configuration
vercel --prod