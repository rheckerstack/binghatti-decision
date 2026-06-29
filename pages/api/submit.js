import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { profile, formData, recommendation } = req.body;

    const emailContent = `
Dubai Investment Decision Framework Submission

INVESTOR PROFILE:
- Goal: ${profile.goal}
- Risk Tolerance: ${profile.risk}
- Timeline: ${profile.timeline}
- Capital: ${profile.capital}
- Experience: ${profile.experience}

DECISION ANSWERS:
- Outcome: ${formData.outcomeChosen}
- Why: ${formData.outcomeWhy}
- Option A: ${formData.optionA}
- Option B: ${formData.optionB}
- Option C: ${formData.optionC}
- Best Case: ${formData.upside}
- Worst Case: ${formData.downside}
- Financial Impact: ${formData.impact}
- Probability Downside: ${formData.probDownside}%
- Can Absorb: ${formData.canSurvive}
- Due Diligence: ${formData.dueDiligence}
- Mitigation: ${formData.mitigation}
- Timeline Commit: ${formData.timelineCommit}

RECOMMENDATION:
${recommendation.rec}

Score: ${recommendation.score}/100

Reasoning: ${recommendation.reasoning}

Gaps:
${recommendation.gaps.map(g => '- ' + g).join('\n')}

---
Submitted: ${new Date().toISOString()}
`;

    // Send email
    const email = await resend.emails.send({
      from: 'submissions@binghatti-dubai.com',
      to: 'info@atapex.co',
      subject: `New Investment Decision Framework Submission - Score ${recommendation.score}/100`,
      text: emailContent,
      html: `
        <h2>Dubai Investment Decision Framework Submission</h2>
        <h3>Recommendation: <strong>${recommendation.rec}</strong></h3>
        <p><strong>Score:</strong> ${recommendation.score}/100</p>
        <p><strong>Reasoning:</strong> ${recommendation.reasoning}</p>
        
        <h3>Investor Profile</h3>
        <ul>
          <li>Goal: ${profile.goal}</li>
          <li>Risk: ${profile.risk}</li>
          <li>Timeline: ${profile.timeline}</li>
          <li>Capital: ${profile.capital}</li>
        </ul>
        
        <h3>Decision Details</h3>
        <p><strong>Outcome:</strong> ${formData.outcomeChosen}</p>
        <p><strong>Worst Case:</strong> ${formData.downside}</p>
        <p><strong>Probability:</strong> ${formData.probDownside}%</p>
        <p><strong>Can Absorb:</strong> ${formData.canSurvive}</p>
        
        <hr />
        <p><small>Submitted: ${new Date().toLocaleString()}</small></p>
      `
    });

    return res.status(200).json({ success: true, messageId: email.id });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Failed to submit' });
  }
}
