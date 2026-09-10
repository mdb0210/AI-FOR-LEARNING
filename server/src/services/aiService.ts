import {
  AIExplanation,
  AIShortNotes,
  Question,
  AnswerSubmission,
  Evaluation,
  PartEvaluation,
  CodingEvaluationDetails,
  MistakeType,
} from '../types/index.js';

export class AIService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  }

  // --- Generate Structured Explanation ---
  async generateExplanation(
    topicTitle: string,
    subjectTitle: string,
    teacherMaterial?: string
  ): Promise<AIExplanation> {
    if (this.apiKey) {
      try {
        const prompt = `You are LearnVault AI, an expert computer science and engineering mentor.
Explain the topic "${topicTitle}" in the subject "${subjectTitle}".
${teacherMaterial ? `Ground your explanation in this teacher-provided material:\n${teacherMaterial}` : ''}

Respond ONLY with valid JSON matching this exact schema:
{
  "whatIsIt": "Clear technical definition",
  "whyDoesItMatter": "Why this matters in software engineering and real applications",
  "simpleExplanation": "Plain-English intuition or analogy",
  "example": "Concrete code snippet or relational schema example",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4"],
  "commonMistakes": ["mistake 1", "mistake 2", "mistake 3"],
  "quickRecap": "1-2 sentence summary"
}`;
        const res = await this.callGeminiRaw(prompt);
        const parsed = JSON.parse(res);
        return {
          topicId: '',
          whatIsIt: parsed.whatIsIt || `A core fundamental concept in ${subjectTitle}.`,
          whyDoesItMatter: parsed.whyDoesItMatter || 'Essential for correct system design and reliable software.',
          simpleExplanation: parsed.simpleExplanation || 'Intuitive mental model for rapid understanding.',
          example: parsed.example || 'Example illustrating implementation details.',
          keyPoints: parsed.keyPoints || ['Core principle', 'Implementation rules'],
          commonMistakes: parsed.commonMistakes || ['Overcomplicating the edge cases'],
          quickRecap: parsed.quickRecap || 'Master the fundamentals before progressing to advanced patterns.',
          disclaimer: 'AI-generated content should be verified with your course material.',
        };
      } catch (err) {
        console.warn('Gemini API call failed, using deterministic AI fallback:', err);
      }
    }

    // Deterministic High-Quality Fallback
    return this.getFallbackExplanation(topicTitle, subjectTitle, teacherMaterial);
  }

  // --- Generate Short Revision Notes ---
  async generateShortNotes(topicTitle: string, subjectTitle: string): Promise<AIShortNotes> {
    if (this.apiKey) {
      try {
        const prompt = `Generate exam-focused short revision notes for "${topicTitle}" (${subjectTitle}).
Return ONLY valid JSON matching this schema:
{
  "title": "Short Notes: ${topicTitle}",
  "definition": "Precise 1-2 sentence definition",
  "keyConcepts": ["concept 1", "concept 2", "concept 3"],
  "formulasRules": ["rule 1", "rule 2"],
  "examples": ["example 1", "example 2"],
  "commonMistakes": ["pitfall 1", "pitfall 2"],
  "examPoints": ["point for exams 1", "point 2"],
  "quickRecap": "Recap sentence"
}`;
        const res = await this.callGeminiRaw(prompt);
        const parsed = JSON.parse(res);
        return {
          topicId: '',
          title: parsed.title || `Revision Notes: ${topicTitle}`,
          definition: parsed.definition || `${topicTitle} is a foundational construct in ${subjectTitle}.`,
          keyConcepts: parsed.keyConcepts || ['Key concept 1', 'Key concept 2'],
          formulasRules: parsed.formulasRules || ['Core rule 1', 'Core rule 2'],
          examples: parsed.examples || ['Standard example'],
          commonMistakes: parsed.commonMistakes || ['Common trap'],
          examPoints: parsed.examPoints || ['High-frequency exam topic'],
          quickRecap: parsed.quickRecap || 'Review definitions, rules, and decomposition steps.',
        };
      } catch (err) {
        console.warn('Gemini API notes failed, using fallback:', err);
      }
    }

    return this.getFallbackShortNotes(topicTitle, subjectTitle);
  }

  // --- Generate Practice Quiz ---
  async generateQuiz(
    subjectTitle: string,
    topicTitle: string,
    difficulty: string = 'Intermediate',
    count: number = 3
  ): Promise<Question[]> {
    if (this.apiKey) {
      try {
        const prompt = `Generate ${count} varied quiz questions for "${topicTitle}" (${subjectTitle}) at difficulty ${difficulty}.
Include a mix of: MCQ, one-line, multi-part, or coding/diagram questions.
Return ONLY valid JSON array matching Question schema:
[
  {
    "id": "gen-1",
    "questionType": "one-line" | "mcq" | "multi-part" | "coding" | "math" | "diagram",
    "title": "Short title",
    "question": "Full prompt",
    "points": 5 | 10,
    "rubric": "Evaluation criteria",
    "options": ["A", "B", "C", "D"], // if mcq
    "correctAnswer": "A", // if mcq
    "parts": [{"id": "p1", "partLetter": "A", "question": "Part A", "points": 2, "rubric": "Part rubric"}] // if multi-part
  }
]`;
        const res = await this.callGeminiRaw(prompt);
        const parsed = JSON.parse(res);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((q, idx) => ({
            ...q,
            id: `ai-gen-${Date.now()}-${idx}`,
          }));
        }
      } catch (err) {
        console.warn('Gemini quiz gen failed, using fallback questions:', err);
      }
    }

    return this.getFallbackQuiz(topicTitle, subjectTitle, count);
  }

  // --- Call Raw Gemini Helper ---
  private async callGeminiRaw(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini HTTP error ${response.status}: ${await response.text()}`);
    }

    const data = (await response.json()) as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No content returned from Gemini');
    return text;
  }

  // --- Fallback Explanations ---
  private getFallbackExplanation(topicTitle: string, subjectTitle: string, teacherMaterial?: string): AIExplanation {
    if (topicTitle.toLowerCase().includes('normaliz')) {
      return {
        topicId: 'topic-dbms-norm',
        whatIsIt: 'Normalization is a structured relational database design technique that decomposes tables to eliminate data redundancy and prevent insertion, update, and deletion anomalies.',
        whyDoesItMatter: 'Without normalization, enterprise systems suffer from duplicate records and data corruption. Updating a customer address in one invoice might leave 40 other invoices with outdated data.',
        simpleExplanation: 'Think of organizing a disorganized closet into labeled drawers. Instead of tossing socks, shirts, and shoes in every drawer, you place shirts in one drawer and socks in another. Tables in a database do the same thing.',
        example: 'Instead of `Order(OrderID, CustomerName, CustomerEmail, ItemID, Price)`, we decompose into `Customers(CustomerID, Name, Email)` and `Orders(OrderID, CustomerID, ItemID, Price)`.',
        keyPoints: [
          '1NF eliminates repeating groups and ensures atomic single-value fields.',
          '2NF eliminates partial dependencies on composite primary keys.',
          '3NF eliminates transitive dependencies between non-key attributes.',
          'BCNF ensures every determinant is a candidate key.',
        ],
        commonMistakes: [
          'Checking for 2NF when the primary key is only a single attribute (2NF is automatically satisfied if 1NF holds with a single PK!).',
          'Confusing foreign key references with invalid transitive dependencies.',
          'Over-normalizing OLAP data warehouses where read-heavy queries require deliberate denormalization.',
        ],
        quickRecap: 'Remember Codd’s rule: "The key (1NF), the whole key (2NF), and nothing but the key (3NF)".',
        disclaimer: 'AI-generated content should be verified with your course material.',
      };
    }

    return {
      topicId: 'generic',
      whatIsIt: `${topicTitle} is an essential concept within ${subjectTitle} that defines how components or logic operate reliably.`,
      whyDoesItMatter: 'Understanding this foundational mechanism allows engineers to build scalable, bug-free, and performant architectures.',
      simpleExplanation: `At its core, ${topicTitle} simplifies complex interactions into predictable, well-defined rules and execution flows.`,
      example: `Standard pattern implementation demonstrating ${topicTitle} under typical software constraints.`,
      keyPoints: [
        `Core definition and operational lifecycle of ${topicTitle}.`,
        'Trade-offs between performance, memory footprint, and implementation complexity.',
        'Industry best practices and edge case safeguards.',
        'Integration with surrounding system protocols.',
      ],
      commonMistakes: [
        'Overlooking edge cases and resource allocation limits.',
        'Assuming standard defaults without validating requirements.',
      ],
      quickRecap: `Mastering ${topicTitle} provides the foundational mental model required for advanced topics in ${subjectTitle}.`,
      disclaimer: 'AI-generated content should be verified with your course material.',
    };
  }

  // --- Fallback Short Notes ---
  private getFallbackShortNotes(topicTitle: string, subjectTitle: string): AIShortNotes {
    return {
      topicId: 'generic',
      title: `Short Notes: ${topicTitle}`,
      definition: `${topicTitle} represents a fundamental paradigm in ${subjectTitle} establishing formal structure and constraints.`,
      keyConcepts: [
        'Primary principles & formal definitions',
        'State lifecycle & operational guarantees',
        'Performance & complexity considerations',
      ],
      formulasRules: [
        'Rule 1: Strict adherence to invariant constraints',
        'Rule 2: Proper resource cleanup and error boundaries',
      ],
      examples: [
        'Standard canonical implementation pattern',
        'Edge case handling for boundary conditions',
      ],
      commonMistakes: [
        'Premature optimization before ensuring correctness',
        'Failing to handle null/boundary inputs',
      ],
      examPoints: [
        'Memorize core definitions and comparison tables',
        'Be ready to diagram the step-by-step state transitions',
      ],
      quickRecap: `${topicTitle}: Key definitions, 2 core rules, and standard design trade-offs.`,
    };
  }

  // --- Fallback Quiz Questions ---
  private getFallbackQuiz(topicTitle: string, subjectTitle: string, count: number): Question[] {
    const list: Question[] = [
      {
        id: `fb-q-1-${Date.now()}`,
        questionType: 'one-line',
        title: `Core Definition: ${topicTitle}`,
        question: `State the precise definition of ${topicTitle} in 1 or 2 technical sentences.`,
        points: 5,
        expectedAnswerStyle: 'Concise 1-2 sentence definition highlighting fundamental purpose.',
        rubric: 'Must state the formal objective, key mechanism, and primary benefit.',
      },
      {
        id: `fb-q-2-${Date.now()}`,
        questionType: 'multi-part',
        title: `Technical Decomposition: ${topicTitle}`,
        question: `Analyze the following aspects of ${topicTitle}:`,
        points: 10,
        parts: [
          {
            id: 'p1',
            partLetter: 'A',
            question: 'What is the primary problem or anomaly this concept solves?',
            points: 3,
            rubric: 'Identifies the specific failure mode, anomaly, or inefficiency.',
          },
          {
            id: 'p2',
            partLetter: 'B',
            question: 'List two critical constraints or prerequisites required.',
            points: 3,
            rubric: 'Names two valid constraints or rules.',
          },
          {
            id: 'p3',
            partLetter: 'C',
            question: 'Provide a concrete real-world example demonstrating its application.',
            points: 4,
            rubric: 'Clear example demonstrating correct understanding.',
          },
        ],
        rubric: 'Graded per sub-part based on technical precision.',
      },
      {
        id: `fb-q-3-${Date.now()}`,
        questionType: 'diagram',
        title: `Conceptual Architecture: ${topicTitle}`,
        question: `Draw or upload a diagram (or provide a detailed structural architecture outline) showing how components interact in ${topicTitle}.`,
        points: 10,
        expectedAnswerStyle: 'Structural diagram or clear visual component flow.',
        rubric: 'Shows correct components, direction of data/flow, and structural relationships.',
      },
    ];

    return list.slice(0, count);
  }
}

export const aiService = new AIService();
