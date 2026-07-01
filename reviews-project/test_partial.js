async function testPartial() {
  try {
    // Test partial customer data
    const partialCustomerData = { id: 2 };
    const customerResponse = await fetch('http://localhost:3000/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partialCustomerData)
    });
    console.log('Partial Customer POST response:', customerResponse.status);

    // Test partial agent data
    const partialAgentData = { id: 2 };
    const agentResponse = await fetch('http://localhost:3000/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partialAgentData)
    });
    console.log('Partial Agent POST response:', agentResponse.status);

    console.log('Partial data tests completed.');
  } catch (error) {
    console.error('Error testing partial API:', error);
  }
}

testPartial();
