import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const testOpenAI = async () => {
  try {
    console.log('🔍 Testing OpenAI API...');
    console.log(`API Key (first 20 chars): ${process.env.OPENAI_API_KEY?.substring(0, 20)}...`);

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    console.log('\n📡 Sending test request to OpenAI...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: 'Say "Hello, API is working!" in JSON format with a "message" field.'
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 50
    });

    console.log('\n✅ OpenAI API is working!');
    console.log('Response:', completion.choices[0].message.content);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ OpenAI API Error:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
};

testOpenAI();
