// Test email validation logic
function testEmailValidation() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  const testEmails = [
    'valid@example.com',
    'user.name@domain.co.uk',
    'test+tag@gmail.com',
    '', // empty
    'invalid-email',
    'missing@domain',
    'missing.domain@',
    '@missing-user.com',
    'spaces in@email.com',
    'valid@example.com ', // trailing space
    ' valid@example.com', // leading space
  ]
  
  console.log('Testing email validation...')
  
  testEmails.forEach(email => {
    const isValid = emailRegex.test(email.trim())
    console.log(`"${email}" -> ${isValid ? '✅ Valid' : '❌ Invalid'}`)
  })
}

testEmailValidation()