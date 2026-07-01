async function testAPI() {
  try {
    // Test customers
    const customerData = { id: 1, name: "John Doe", email: "john@example.com", phone: "1234567890" };
    const customerResponse = await fetch('http://localhost:3000/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData)
    });
    console.log('Customer POST response:', customerResponse.status);

    // Test agents
    const agentData = { id: 1, name: "Agent Smith", spec: "Travel Specialist", phone: "0987654321" };
    const agentResponse = await fetch('http://localhost:3000/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agentData)
    });
    console.log('Agent POST response:', agentResponse.status);

    // Test destinations
    const destData = { id: 1, name: "Paris", country: "France", price: "1500" };
    const destResponse = await fetch('http://localhost:3000/api/destinations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(destData)
    });
    console.log('Destination POST response:', destResponse.status);

    // Test bookings
    const bookingData = { cid: 1, aid: 1, did: 1, date: "2023-12-01", duration: "7" };
    const bookingResponse = await fetch('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    console.log('Booking POST response:', bookingResponse.status);

    // Test reviews
    const reviewData = { customer_id: 1, agent_id: 1, destination_id: 1, rating: 5, comments: "Great service!" };
    const reviewResponse = await fetch('http://localhost:3000/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    console.log('Review POST response:', reviewResponse.status);

    console.log('All API tests completed. Check travel-data.csv for updates.');
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI();
