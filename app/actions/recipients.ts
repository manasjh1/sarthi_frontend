"use server"

// In a real app, this would connect to your database
// This is a mock implementation for demonstration purposes

// Mock database of recipients
const mockRecipients = [
  { id: 1, name: "Alex Johnson", email: "alex@example.com", phone: "+1234567890" },
  { id: 2, name: "Samantha Williams", email: "sam@example.com", phone: "+1987654321" },
  { id: 3, name: "Michael Brown", email: "michael@example.com", phone: "+1122334455" },
  { id: 4, name: "Amanda Davis", email: "amanda@example.com", phone: "+1555666777" },
  { id: 5, name: "Christopher Wilson", email: "chris@example.com", phone: "+1888999000" },
  { id: 6, name: "Jessica Martinez", email: "jessica@example.com", phone: "+1444333222" },
  { id: 7, name: "David Anderson", email: "david@example.com", phone: "+1777888999" },
  { id: 8, name: "Jennifer Taylor", email: "jennifer@example.com", phone: "+1666555444" },
  { id: 9, name: "Robert Thomas", email: "robert@example.com", phone: "+1333222111" },
  { id: 10, name: "Elizabeth Garcia", email: "elizabeth@example.com", phone: "+1222333444" },
  { id: 11, name: "Aman Sharma", email: "aman@example.com", phone: "+1999888777" },
  { id: 12, name: "Amandeep Singh", email: "amandeep@example.com", phone: "+1111222333" },
  { id: 13, name: "Amanda Lee", email: "amandalee@example.com", phone: "+1444555666" },
  { id: 14, name: "Amani Jackson", email: "amani@example.com", phone: "+1777666555" },
]

export async function searchRecipients(query: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  if (!query.trim()) return []

  // Filter recipients that match the query
  const results = mockRecipients.filter(
    (recipient) =>
      recipient.name.toLowerCase().includes(query.toLowerCase()) ||
      recipient.email.toLowerCase().includes(query.toLowerCase()) ||
      recipient.phone.includes(query),
  )

  // Return only the necessary data
  return results.map((recipient) => ({
    id: recipient.id,
    name: recipient.name,
    email: recipient.email,
    phone: recipient.phone,
  }))
}

export async function getRecentRecipients(limit = 5) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  // In a real app, you would fetch the most recent recipients
  // For this mock, we'll just return the first few
  return mockRecipients.slice(0, limit).map((recipient) => ({
    id: recipient.id,
    name: recipient.name,
    email: recipient.email,
    phone: recipient.phone,
  }))
}