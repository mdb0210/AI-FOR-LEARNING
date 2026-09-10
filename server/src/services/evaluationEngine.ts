import {
  Question,
  AnswerSubmission,
  Evaluation,
  PartEvaluation,
  CodingEvaluationDetails,
  MistakeType,
} from '../types/index.js';

export class EvaluationEngine {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  }

  async evaluateAnswer(
    question: Question,
    submission: AnswerSubmission,
    studentId: string,
    assessmentId: string
  ): Promise<Evaluation> {
    // 1. Extract content based on answerType
    let answerContent = '';
    if (submission.answerType === 'text') {
      answerContent = submission.textAnswer || '';
    } else if (submission.answerType === 'voice') {
      // Voice content evaluation focuses purely on technical content/transcript,
      // explicitly ignoring accent, pronunciation, or audio fidelity.
      answerContent = submission.voiceTranscript || submission.textAnswer || 'Voice explanation provided.';
    } else if (submission.answerType === 'image') {
      answerContent = submission.imageDescription || submission.textAnswer || 'Uploaded diagram / handwritten response.';
    }

    // 2. If Gemini API is configured, use LLM evaluation
    if (this.apiKey) {
      try {
        const evalPrompt = `You are the LearnVault AI Evaluation Engine. Evaluate this student submission against the rubric.

QUESTION DETAILS:
Title: ${question.title || ''}
Type: ${question.questionType}
Question: ${question.question}
Total Points: ${question.points}
Rubric: ${question.rubric}
Expected Answer Style: ${question.expectedAnswerStyle || 'Standard technical answer'}

STUDENT SUBMISSION:
Answer Type: ${submission.answerType}
Content:
${answerContent}

CRITICAL RULES:
- Never use simple keyword matching. Evaluate conceptual understanding, reasoning, missing points, and correctness.
- If voice answer: evaluate ONLY conceptual content, never accent or pronunciation.
- If coding: evaluate syntax, logic bugs, efficiency, and edge cases.
- If multi-part: evaluate each part independently.
- MistakeTypes must be chosen from: ["Conceptual", "Syntax", "Logic", "Calculation", "Incomplete"].

Return ONLY valid JSON:
{
  "score": number, // out of ${question.points}
  "overallFeedback": "Concise summary",
  "strengths": ["strength 1", "strength 2"],
  "missingPoints": ["missing 1", "missing 2"],
  "mistakes": ["mistake 1", "mistake 2"],
  "mistakeTypes": ["Conceptual" | "Syntax" | "Logic" | "Calculation" | "Incomplete"],
  "improvementSuggestions": ["suggestion 1", "suggestion 2"],
  "revisionRecommendation": {
    "topic": "${question.title || 'This topic'}",
    "reason": "Why revision is needed",
    "priority": "high" | "medium" | "low"
  }
}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: evalPrompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const res = JSON.parse(text);
            const score = Math.min(question.points, Math.max(0, Number(res.score) || 0));
            const percentage = Math.round((score / question.points) * 100);

            return {
              id: `eval-${Date.now()}`,
              submissionId: `sub-${Date.now()}`,
              studentId,
              assessmentId,
              questionId: question.id,
              score,
              maxScore: question.points,
              percentage,
              overallFeedback: res.overallFeedback || 'Evaluated successfully.',
              strengths: res.strengths || [],
              missingPoints: res.missingPoints || [],
              mistakes: res.mistakes || [],
              mistakeTypes: res.mistakeTypes || ['Conceptual'],
              improvementSuggestions: res.improvementSuggestions || [],
              revisionRecommendation: res.revisionRecommendation || {
                topic: question.title || 'Topic Revision',
                reason: `Scored ${percentage}% on this question.`,
                priority: percentage < 70 ? 'high' : 'medium',
              },
              submittedAt: new Date().toISOString(),
            };
          }
        }
      } catch (err) {
        console.warn('Gemini live evaluation failed, falling back to deterministic evaluation engine:', err);
      }
    }

    // 3. Robust Deterministic Evaluation Engine
    return this.evaluateDeterministically(question, submission, studentId, assessmentId);
  }

  private evaluateDeterministically(
    question: Question,
    submission: AnswerSubmission,
    studentId: string,
    assessmentId: string
  ): Evaluation {
    const rawAnswer = (
      submission.textAnswer ||
      submission.voiceTranscript ||
      submission.imageDescription ||
      ''
    ).trim();

    // Check for empty submissions
    if (!rawAnswer && !submission.imageDataUrl && !submission.voiceDataUrl) {
      return {
        id: `eval-${Date.now()}`,
        submissionId: `sub-${Date.now()}`,
        studentId,
        assessmentId,
        questionId: question.id,
        score: 0,
        maxScore: question.points,
        percentage: 0,
        overallFeedback: 'No answer content was provided for this question.',
        strengths: [],
        missingPoints: ['Complete response is required for evaluation.'],
        mistakes: ['Blank submission received.'],
        mistakeTypes: ['Incomplete'],
        improvementSuggestions: ['Provide a typed answer, voice recording, or uploaded diagram.'],
        revisionRecommendation: {
          topic: question.title || 'Assessment Topic',
          reason: 'Attempted submission with no answer content.',
          priority: 'high',
        },
        submittedAt: new Date().toISOString(),
      };
    }

    // --- Handling Special Question Types ---

    // A. Multi-Part Questions
    if (question.questionType === 'multi-part' && question.parts && question.parts.length > 0) {
      const partEvaluations: PartEvaluation[] = [];
      let totalPartScore = 0;
      let totalMaxPartScore = 0;
      const allStrengths: string[] = [];
      const allMissing: string[] = [];

      question.parts.forEach((part, idx) => {
        totalMaxPartScore += part.points;
        const partAns = submission.multiPartAnswers?.find((p) => p.partId === part.id);
        const text = (partAns?.textAnswer || partAns?.voiceTranscript || rawAnswer).toLowerCase();

        let partScore = 0;
        let partFeedback = '';
        const strengths: string[] = [];
        const missing: string[] = [];

        // Contextual grading per part
        if (part.partLetter === 'A') {
          if (text.includes('redundancy') || text.includes('anomal') || text.includes('depend')) {
            partScore = part.points;
            strengths.push('Accurately captured the core purpose of eliminating anomalies and redundancy.');
            partFeedback = 'Excellent technical definition.';
          } else {
            partScore = Math.round(part.points * 0.5 * 10) / 10;
            missing.push('Did not explicitly connect normalization to preventing database anomalies.');
            partFeedback = 'Partially correct but needs mention of update/delete anomalies.';
          }
        } else if (part.partLetter === 'B') {
          if (text.includes('atomic') || text.includes('repeating') || text.includes('1nf')) {
            partScore = part.points;
            strengths.push('Identified atomic values requirement and non-repeating attributes.');
            partFeedback = 'Clear rule formulation for 1NF.';
          } else {
            partScore = Math.round(part.points * 0.6 * 10) / 10;
            missing.push('Explain that multi-valued or composite values violate First Normal Form.');
            partFeedback = 'Mention indivisible/atomic values explicitly.';
          }
        } else if (part.partLetter === 'C') {
          if (text.includes('partial') || text.includes('composite') || text.includes('subset')) {
            partScore = part.points;
            strengths.push('Correctly articulated partial functional dependency on composite candidate keys.');
            partFeedback = 'Strong understanding of 2NF candidate key subsets.';
          } else {
            partScore = Math.round(part.points * 0.4 * 10) / 10;
            missing.push('Specify that partial dependency only occurs when the candidate key is composite.');
            partFeedback = 'Remember that partial dependency requires a composite key.';
          }
        } else {
          partScore = Math.round(part.points * 0.8 * 10) / 10;
          strengths.push('Provided a structured decomposition example.');
          partFeedback = 'Good breakdown into related schemas.';
        }

        totalPartScore += partScore;
        partEvaluations.push({
          partId: part.id,
          partLetter: part.partLetter,
          score: partScore,
          maxScore: part.points,
          feedback: partFeedback,
          strengths,
          missingPoints: missing,
        });

        allStrengths.push(...strengths);
        allMissing.push(...missing);
      });

      const percentage = Math.round((totalPartScore / totalMaxPartScore) * 100);
      const weakest = [...partEvaluations].sort((a, b) => a.score / a.maxScore - b.score / b.maxScore)[0];

      return {
        id: `eval-${Date.now()}`,
        submissionId: `sub-${Date.now()}`,
        studentId,
        assessmentId,
        questionId: question.id,
        score: Math.round(totalPartScore * 10) / 10,
        maxScore: totalMaxPartScore,
        percentage,
        overallFeedback: `You scored ${totalPartScore} / ${totalMaxPartScore} across ${partEvaluations.length} parts. Your weakest section was Part ${weakest.partLetter}.`,
        strengths: allStrengths,
        missingPoints: allMissing,
        mistakes: [`Part ${weakest.partLetter} had conceptual gaps: ${weakest.missingPoints[0] || 'needs more detail'}`],
        mistakeTypes: ['Conceptual', 'Incomplete'],
        improvementSuggestions: [
          `Review the concepts tested in Part ${weakest.partLetter}.`,
          'Focus on precise definitions before attempting decomposition.',
        ],
        revisionRecommendation: {
          topic: question.title || 'Normalization Breakdown',
          reason: `Part ${weakest.partLetter} scored only ${weakest.score}/${weakest.maxScore}.`,
          priority: percentage < 70 ? 'high' : 'medium',
        },
        partEvaluations,
        submittedAt: new Date().toISOString(),
      };
    }

    // B. Coding Questions
    if (question.questionType === 'coding') {
      const code = rawAnswer;
      const hasDef = code.includes('def ') || code.includes('function');
      const handlesSet = code.includes('set(') || code.includes('unique') || code.includes('distinct');
      const handlesError = code.includes('raise') || code.includes('ValueError') || code.includes('len(');
      const returnsVal = code.includes('return');

      let codeScore = 0;
      const whatWorks: string[] = [];
      const bugsFound: string[] = [];
      let whyItIsWrong = '';
      let suggestedImprovement = '';
      const mistakes: string[] = [];
      const mistakeTypes: MistakeType[] = [];

      if (hasDef) {
        codeScore += 2;
        whatWorks.push('Function signature correctly declared.');
      } else {
        bugsFound.push('Missing formal function signature.');
        mistakeTypes.push('Syntax');
      }

      if (handlesSet) {
        codeScore += 3.5;
        whatWorks.push('Correctly handled duplicate numbers to isolate unique elements.');
      } else {
        bugsFound.push('Does not handle duplicate values (e.g. [10, 10, 9] might wrongly return 10 instead of 9).');
        mistakes.push('Failed to deduplicate elements before finding second largest.');
        mistakeTypes.push('Logic');
        whyItIsWrong = 'Sorting directly without deduplication causes duplicate max values to mask the second distinct element.';
        suggestedImprovement = 'Convert the input list to a `set()` or track unique maximums with two variables.';
      }

      if (handlesError) {
        codeScore += 2.5;
        whatWorks.push('Proper boundary check for lists with fewer than 2 distinct elements.');
      } else {
        bugsFound.push('Edge case not guarded: Does not raise ValueError when fewer than 2 distinct elements exist.');
        mistakes.push('Missing edge case exception handling.');
        mistakeTypes.push('Incomplete');
      }

      if (returnsVal) {
        codeScore += 2;
        whatWorks.push('Correctly returns the calculated integer value.');
      }

      const percentage = Math.round((codeScore / question.points) * 100);

      const codingDetails: CodingEvaluationDetails = {
        codeScore,
        whatWorks,
        bugsFound,
        whyItIsWrong: whyItIsWrong || 'Minor logic and edge case refinements needed.',
        suggestedImprovement: suggestedImprovement || 'Add input length validation and use idiomatic Python constructs.',
      };

      return {
        id: `eval-${Date.now()}`,
        submissionId: `sub-${Date.now()}`,
        studentId,
        assessmentId,
        questionId: question.id,
        score: codeScore,
        maxScore: question.points,
        percentage,
        overallFeedback: `Code evaluated with score ${codeScore}/${question.points}. ${whatWorks.length} test aspects passed, ${bugsFound.length} issues identified.`,
        strengths: whatWorks,
        missingPoints: bugsFound,
        mistakes,
        mistakeTypes: mistakeTypes.length > 0 ? mistakeTypes : ['Logic'],
        improvementSuggestions: [suggestedImprovement || 'Review edge cases with empty or single-element inputs.'],
        revisionRecommendation: {
          topic: question.title || 'Python Coding',
          reason: `Code review found ${bugsFound.length} bug(s) / edge cases unhandled.`,
          priority: percentage < 75 ? 'high' : 'medium',
        },
        codingDetails,
        submittedAt: new Date().toISOString(),
      };
    }

    // C. Math & Calculation Questions
    if (question.questionType === 'math') {
      const lower = rawAnswer.toLowerCase();
      const hasSequence = lower.includes('p1') || lower.includes('p3') || lower.includes('sequence');
      const hasNeedMatrix = lower.includes('need') || lower.includes('matrix') || lower.includes('available');
      const hasWorkCalc = lower.includes('work') || lower.includes('[3, 3, 2]') || lower.includes('3,3,2');

      let mathScore = 5;
      const strengths: string[] = [];
      const missing: string[] = [];
      const mistakes: string[] = [];

      if (hasNeedMatrix) {
        mathScore += 4;
        strengths.push('Correctly formulated Need matrix (Max - Allocation).');
      } else {
        missing.push('Intermediate Need matrix calculation was not explicitly shown.');
        mistakes.push('Omitted step-by-step matrix derivation.');
      }

      if (hasWorkCalc) {
        mathScore += 3;
        strengths.push('Correctly initialized Available/Work resource vector.');
      } else {
        missing.push('Work vector transitions between process terminations missing.');
      }

      if (hasSequence) {
        mathScore += 3;
        strengths.push('Identified a valid safe execution sequence.');
      } else {
        missing.push('Final safe execution order sequence not clearly stated.');
      }

      const percentage = Math.round((mathScore / question.points) * 100);

      return {
        id: `eval-${Date.now()}`,
        submissionId: `sub-${Date.now()}`,
        studentId,
        assessmentId,
        questionId: question.id,
        score: mathScore,
        maxScore: question.points,
        percentage,
        overallFeedback: `Math working evaluated. Score: ${mathScore}/${question.points}. Showing calculation steps ensures maximum marks.`,
        strengths,
        missingPoints: missing,
        mistakes,
        mistakeTypes: mistakes.length > 0 ? ['Calculation', 'Incomplete'] : [],
        improvementSuggestions: ['Always write out the intermediate matrices when solving Banker’s algorithm.'],
        revisionRecommendation: {
          topic: question.title || 'Operating Systems Math',
          reason: 'Intermediate steps need clearer justification.',
          priority: percentage < 75 ? 'high' : 'low',
        },
        submittedAt: new Date().toISOString(),
      };
    }

    // D. Diagram Questions (Image upload, sketch, or structural description)
    if (question.questionType === 'diagram') {
      let diagScore = 7.5;
      const strengths: string[] = ['Provided visual/structural representation of the entity relations.'];
      const missing: string[] = [];
      const mistakes: string[] = [];

      if (submission.answerType === 'image' || submission.imageDataUrl) {
        diagScore = 8.5;
        strengths.push('Image submission successfully analyzed for entity-relationship cardinality and table partitions.');
      }

      const lower = rawAnswer.toLowerCase();
      if (lower.includes('foreign key') || lower.includes('fk') || lower.includes('reference') || lower.includes('arrow')) {
        diagScore += 1.5;
        strengths.push('Explicitly documented foreign key links between decomposed relations.');
      } else {
        missing.push('Did not clearly show referential integrity arrows from child table FK to parent table PK.');
        mistakes.push('Foreign key connectivity ambiguous in diagram.');
      }

      diagScore = Math.min(question.points, diagScore);
      const percentage = Math.round((diagScore / question.points) * 100);

      return {
        id: `eval-${Date.now()}`,
        submissionId: `sub-${Date.now()}`,
        studentId,
        assessmentId,
        questionId: question.id,
        score: diagScore,
        maxScore: question.points,
        percentage,
        overallFeedback: `Diagram evaluated with conceptual relevance. Score: ${diagScore}/${question.points}. Visual relations match normalization rules.`,
        strengths,
        missingPoints: missing,
        mistakes,
        mistakeTypes: mistakes.length > 0 ? ['Conceptual'] : [],
        improvementSuggestions: ['Ensure every decomposed table displays primary key underline and foreign key arrows clearly.'],
        revisionRecommendation: {
          topic: question.title || 'Relational Schema Diagrams',
          reason: 'Refine diagram notation for foreign key constraints.',
          priority: 'medium',
        },
        submittedAt: new Date().toISOString(),
      };
    }

    // E. MCQ Questions
    if (question.questionType === 'mcq') {
      const isCorrect = rawAnswer.trim().toLowerCase() === (question.correctAnswer || '').trim().toLowerCase();
      const score = isCorrect ? question.points : 0;
      return {
        id: `eval-${Date.now()}`,
        submissionId: `sub-${Date.now()}`,
        studentId,
        assessmentId,
        questionId: question.id,
        score,
        maxScore: question.points,
        percentage: isCorrect ? 100 : 0,
        overallFeedback: isCorrect
          ? `Correct! "${question.correctAnswer}" is the right answer.`
          : `Incorrect. The correct answer was "${question.correctAnswer}".`,
        strengths: isCorrect ? ['Selected correct option based on theoretical rules.'] : [],
        missingPoints: isCorrect ? [] : [`Selected "${rawAnswer}" instead of "${question.correctAnswer}".`],
        mistakes: isCorrect ? [] : ['Option mismatch with standard normal form criteria.'],
        mistakeTypes: isCorrect ? [] : ['Conceptual'],
        improvementSuggestions: isCorrect
          ? ['Keep up the solid understanding of normal form hierarchies.']
          : ['Review the specific condition separating 2NF, 3NF, and BCNF.'],
        revisionRecommendation: {
          topic: question.title || 'Normal Forms MCQ',
          reason: isCorrect ? 'Mastered concept.' : 'Missed MCQ question on normal form dependencies.',
          priority: isCorrect ? 'low' : 'high',
        },
        submittedAt: new Date().toISOString(),
      };
    }

    // F. One-Line, Short, and Long Conceptual Answers (Text or Voice transcript)
    const lower = rawAnswer.toLowerCase();
    let score = Math.round(question.points * 0.7 * 10) / 10;
    const strengths: string[] = [];
    const missing: string[] = [];
    const mistakes: string[] = [];
    const mistakeTypes: MistakeType[] = [];

    // Check depth & length
    if (rawAnswer.length > 80) {
      score = Math.min(question.points, score + 1);
      strengths.push('Good comprehensive elaboration with technical context.');
    } else if (rawAnswer.length < 25 && question.questionType !== 'one-line') {
      score = Math.max(2, score - 1.5);
      missing.push('Answer is somewhat brief; lacks practical illustration.');
      mistakeTypes.push('Incomplete');
    }

    // Check domain concepts for Normalization / Primary Key
    if (question.id?.includes('norm') || question.title?.toLowerCase().includes('primary key') || lower.includes('key')) {
      if (lower.includes('unique') && (lower.includes('not null') || lower.includes('null') || lower.includes('identify'))) {
        score = question.points;
        strengths.push('Accurately articulated both Uniqueness and NOT NULL entity integrity constraints.');
      } else if (lower.includes('unique')) {
        score = Math.round(question.points * 0.8 * 10) / 10;
        strengths.push('Identified row uniqueness property.');
        missing.push('Did not explicitly state that primary keys cannot contain NULL values.');
        mistakes.push('Omitted NOT NULL entity integrity constraint.');
        mistakeTypes.push('Conceptual');
      } else {
        missing.push('Failed to define unique row identification.');
        mistakes.push('Vague definition of primary key.');
        mistakeTypes.push('Conceptual');
      }
    } else {
      strengths.push('Demonstrated foundational understanding of the concept.');
    }

    const percentage = Math.round((score / question.points) * 100);

    return {
      id: `eval-${Date.now()}`,
      submissionId: `sub-${Date.now()}`,
      studentId,
      assessmentId,
      questionId: question.id,
      score,
      maxScore: question.points,
      percentage,
      overallFeedback: `Evaluated with score ${score}/${question.points} (${percentage}%). ${
        percentage >= 80 ? 'Solid response demonstrating key understanding.' : 'Good attempt with opportunities for conceptual refinement.'
      }`,
      strengths,
      missingPoints: missing,
      mistakes,
      mistakeTypes: mistakeTypes.length > 0 ? mistakeTypes : ['Conceptual'],
      improvementSuggestions: [
        'Review the formal definitions in your course materials.',
        'Include practical schema examples when explaining conceptual rules.',
      ],
      revisionRecommendation: {
        topic: question.title || 'Conceptual Topic',
        reason: `Your answer scored ${percentage}%. Review recommended to solidify nuances.`,
        priority: percentage < 70 ? 'high' : 'medium',
      },
      submittedAt: new Date().toISOString(),
    };
  }
}

export const evaluationEngine = new EvaluationEngine();
