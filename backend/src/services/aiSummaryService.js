import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const AI_PROVIDER = process.env.AI_PROVIDER || 'huggingface'; // Default to free Hugging Face

// Initialize OpenAI client (only if using OpenAI)
const openai = AI_PROVIDER === 'openai' ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

/**
 * Call Hugging Face API (FREE!)
 */
async function callHuggingFaceAPI(prompt) {
  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || 'hf_demo';

  // Try multiple models in case one is down
  const models = [
    'mistralai/Mistral-7B-Instruct-v0.2',
    'meta-llama/Meta-Llama-3-8B-Instruct',
    'microsoft/Phi-3-mini-4k-instruct'
  ];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 2000,
              temperature: 0.7,
              return_full_text: false
            }
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        return result[0]?.generated_text || result.generated_text;
      }

      // If this model failed, try next one
      console.log(`Model ${model} failed with status ${response.status}, trying next...`);
    } catch (error) {
      console.log(`Model ${model} error:`, error.message);
    }
  }

  throw new Error('All Hugging Face models unavailable. Please try again later or use OpenAI.');
}

/**
 * Generate AI summary from session transcript
 * @param {Object} params - Summary generation parameters
 * @param {Array} params.transcript - Array of transcript entries
 * @param {Object} params.sessionInfo - Session metadata
 * @returns {Object} Generated summary and analysis
 */
export const generateSessionSummary = async ({ transcript, sessionInfo }) => {
  try {
    // Format transcript for AI processing
    const formattedTranscript = formatTranscript(transcript);

    // Create AI prompt
    const prompt = createSummaryPrompt(formattedTranscript, sessionInfo);

    let aiResponseText;

    if (AI_PROVIDER === 'openai' && openai) {
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational session analyst. You analyze video session transcripts and provide comprehensive summaries, insights, and recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });
      aiResponseText = completion.choices[0].message.content;
    } else {
      // Call FREE Hugging Face API
      const systemMessage = 'You are an expert educational session analyst. You analyze video session transcripts and provide comprehensive summaries, insights, and recommendations.\n\n';
      aiResponseText = await callHuggingFaceAPI(systemMessage + prompt + '\n\nRespond ONLY with valid JSON, no other text.');

      // Extract JSON from response (Hugging Face might include extra text)
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponseText = jsonMatch[0];
      }
    }

    // Parse AI response
    const aiResponse = JSON.parse(aiResponseText);

    // Calculate statistics
    const statistics = calculateStatistics(transcript);

    // Return structured summary
    return {
      summary: {
        overview: aiResponse.overview || '',
        mainTopics: aiResponse.mainTopics || [],
        keyLearningPoints: aiResponse.keyLearningPoints || [],
        actionItems: aiResponse.actionItems || [],
        highlights: aiResponse.highlights || []
      },
      analysis: {
        engagement: aiResponse.engagement || {},
        teachingQuality: aiResponse.teachingQuality || {},
        learningProgress: aiResponse.learningProgress || {},
        overallRating: aiResponse.overallRating || 0,
        recommendations: aiResponse.recommendations || []
      },
      statistics
    };
  } catch (error) {
    console.error('AI summary generation error:', error);
    throw new Error(`Failed to generate AI summary: ${error.message}`);
  }
};

/**
 * Format transcript for AI processing
 */
function formatTranscript(transcript) {
  return transcript.map((entry, index) => {
    const timestamp = formatTimestamp(entry.timestamp || index * 10);
    return `[${timestamp}] ${entry.speaker.toUpperCase()} (${entry.speakerName}): ${entry.text}`;
  }).join('\n');
}

/**
 * Format timestamp in HH:MM:SS
 */
function formatTimestamp(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Create AI prompt for summary generation
 */
function createSummaryPrompt(formattedTranscript, sessionInfo) {
  return `Analyze the following educational session transcript and provide a comprehensive summary and analysis.

**Session Information:**
- Subject: ${sessionInfo.skill}
- Duration: ${sessionInfo.duration} minutes
- Teacher: ${sessionInfo.teacherName}
- Learner: ${sessionInfo.learnerName}

**Transcript:**
${formattedTranscript}

**Please provide a JSON response with the following structure:**
{
  "overview": "A brief 2-3 sentence overview of the entire session",

  "mainTopics": [
    {
      "topic": "Topic name",
      "description": "What was discussed",
      "timestamp": 0
    }
  ],

  "keyLearningPoints": [
    "Important concept or skill learned"
  ],

  "actionItems": [
    {
      "description": "Homework or follow-up task",
      "assignedTo": "teacher|learner|both"
    }
  ],

  "highlights": [
    {
      "description": "Important moment in the session",
      "timestamp": 0,
      "importance": "low|medium|high"
    }
  ],

  "engagement": {
    "score": 8.5,
    "teacherParticipation": 60,
    "learnerParticipation": 40,
    "interactionQuality": "Description of interaction quality"
  },

  "teachingQuality": {
    "score": 8.0,
    "clarity": 8,
    "pacing": 7,
    "responsiveness": 9,
    "feedback": "Feedback on teaching approach"
  },

  "learningProgress": {
    "score": 7.5,
    "questionsAsked": 5,
    "conceptsGrasped": ["Concept 1", "Concept 2"],
    "areasNeedingImprovement": ["Area 1"]
  },

  "overallRating": 8.0,

  "recommendations": [
    "Suggestion for improvement"
  ]
}

**Analysis Guidelines:**
- Scores should be from 0-10
- Be objective and constructive
- Focus on educational value
- Identify specific moments of excellence or areas needing improvement
- Provide actionable recommendations
`;
}

/**
 * Calculate session statistics
 */
function calculateStatistics(transcript) {
  let teacherSpeakTime = 0;
  let learnerSpeakTime = 0;
  let teacherWords = 0;
  let learnerWords = 0;

  transcript.forEach(entry => {
    const words = entry.text.split(/\s+/).length;
    const speakTime = words * 0.4; // Approximate: 0.4 seconds per word

    if (entry.speaker === 'teacher') {
      teacherSpeakTime += speakTime;
      teacherWords += words;
    } else {
      learnerSpeakTime += speakTime;
      learnerWords += words;
    }
  });

  const totalDuration = teacherSpeakTime + learnerSpeakTime;
  const silenceTime = Math.max(0, totalDuration * 0.1); // Estimate 10% silence

  return {
    totalDuration: Math.round(totalDuration + silenceTime),
    teacherSpeakTime: Math.round(teacherSpeakTime),
    learnerSpeakTime: Math.round(learnerSpeakTime),
    silenceTime: Math.round(silenceTime),
    wordsSpoken: {
      teacher: teacherWords,
      learner: learnerWords
    }
  };
}

/**
 * Check if AI service is configured
 */
export const isOpenAIConfigured = () => {
  // Hugging Face works without API key (rate limited)
  if (AI_PROVIDER === 'huggingface') {
    return true; // Always available!
  }
  // OpenAI requires valid API key
  return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key';
};

export default {
  generateSessionSummary,
  isOpenAIConfigured
};
