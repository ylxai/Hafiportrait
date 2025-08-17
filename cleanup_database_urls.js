// Script to cleanup old URLs in database via API
// Run this in browser console when logged in as admin

async function cleanupOldUrls() {
  console.log('🧹 Starting database URL cleanup...');
  
  try {
    // First, get all events to check for old URLs
    console.log('📋 Fetching all events...');
    const eventsResponse = await fetch('/api/admin/events');
    const events = await eventsResponse.json();
    
    console.log(`Found ${events.length} events to check`);
    
    let updatedCount = 0;
    const oldDomain = 'bwpwwtphgute.ap-southeast-1.clawcloudrun.com';
    const newBaseUrl = 'http://147.251.255.227:3000';
    
    for (const event of events) {
      let needsUpdate = false;
      let updateData = {};
      
      // Check shareable_link
      if (event.shareable_link && event.shareable_link.includes(oldDomain)) {
        console.log(`🔧 Updating shareable_link for event: ${event.name}`);
        updateData.shareable_link = `${newBaseUrl}/event/${event.id}?code=${event.access_code}`;
        needsUpdate = true;
      }
      
      // Check qr_code URL
      if (event.qr_code && event.qr_code.includes(oldDomain)) {
        console.log(`🔧 Updating QR code for event: ${event.name}`);
        const newEventUrl = `${newBaseUrl}/event/${event.id}?code=${event.access_code}`;
        updateData.qr_code = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(newEventUrl)}`;
        needsUpdate = true;
      }
      
      // Update the event if needed
      if (needsUpdate) {
        try {
          const updateResponse = await fetch(`/api/admin/events/${event.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
          });
          
          if (updateResponse.ok) {
            console.log(`✅ Updated event: ${event.name}`);
            updatedCount++;
          } else {
            console.error(`❌ Failed to update event: ${event.name}`);
          }
        } catch (updateError) {
          console.error(`❌ Error updating event ${event.name}:`, updateError);
        }
        
        // Add small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`\n✅ Cleanup completed!`);
    console.log(`📊 Updated ${updatedCount} events`);
    console.log(`🔗 All URLs now use: ${newBaseUrl}`);
    
    // Refresh the page to see updated data
    if (updatedCount > 0) {
      console.log('🔄 Refreshing page to show updated data...');
      setTimeout(() => window.location.reload(), 2000);
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Run the cleanup
cleanupOldUrls();