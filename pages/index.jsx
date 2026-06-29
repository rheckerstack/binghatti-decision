import { useState } from 'react';
import jsPDF from 'jspdf';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState({
    goal: '',
    risk: '',
    experience: '',
    timeline: '',
    capital: ''
  });
  const [formData, setFormData] = useState({
    outcomeChosen: '',
    outcomeWhy: '',
    optionA: '',
    optionB: '',
    optionC: '',
    upside: '',
    downside: '',
    downsideCustom: '',
    impact: '',
    probDownside: 30,
    canSurvive: '',
    dueDiligence: '',
    mitigation: '',
    timelineCommit: '',
    decision: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState('');

  const handleProfileSelect = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const startFramework = () => {
    if (!profile.goal || !profile.risk || !profile.experience || !profile.timeline || !profile.capital) {
      alert('Please complete your profile');
      return;
    }
    setCurrentStep(1);
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const generateRecommendation = () => {
    let score = 0;
    let gaps = [];
    let rec = '';
    let reasoning = '';

    if (formData.outcomeChosen && formData.outcomeChosen.length > 10) score += 15;
    if (formData.canSurvive === 'easily') score += 25;
    if (formData.canSurvive === 'tight') score += 12;
    if (formData.dueDiligence && formData.dueDiligence.length > 40) score += 20;
    if (formData.mitigation && formData.mitigation.length > 40) score += 20;
    if (formData.probDownside <= 35) score += 10;

    if (!formData.dueDiligence || formData.dueDiligence.length < 30) gaps.push('Your due diligence plan is too thin. Get independent legal review, verify payment escrow, check developer track record.');
    if (formData.canSurvive === 'no') gaps.push('You cannot absorb the downside. This is a blocker. Do not proceed.');
    if (formData.probDownside > 50 && formData.canSurvive === 'tight') gaps.push('High probability downside + tight finances = too much risk. Wait for certainty.');
    if (!formData.mitigation || formData.mitigation.length < 30) gaps.push('Your mitigation plan is vague. What exactly happens if negative cash flow hits for 24 months?');
    if (profile.risk === 'conservative' && formData.downside.includes('20-30')) gaps.push('This downside doesn\'t match your conservative profile. Choose a safer property.');

    if (gaps.length >= 3) {
      rec = 'DO NOT PROCEED (yet)';
      reasoning = 'You have 3+ critical gaps. Fix these first (2-4 weeks of work). You\'re not ready.';
    } else if (formData.canSurvive === 'no') {
      rec = 'PASS';
      reasoning = 'You cannot absorb the realistic downside. Your risk tolerance doesn\'t match this investment.';
    } else if (score >= 70 && formData.canSurvive === 'easily' && gaps.length === 0) {
      rec = 'MOVE FORWARD';
      reasoning = 'Your goals are clear. You understand the downside. You can absorb it. You have a real mitigation plan. You\'re ready. Execute.';
    } else if (score >= 60 && formData.canSurvive === 'tight' && gaps.length <= 1) {
      rec = 'CAUTIOUS PROCEED';
      reasoning = 'You meet the criteria, but your financial buffer is tight. Only proceed if you can comfortably absorb 24+ months of negative cash flow.';
    } else if (score >= 50 || gaps.length === 1) {
      rec = 'WAIT & STRENGTHEN';
      reasoning = 'You\'re close, but you have 1-2 gaps. Spend 4-6 weeks strengthening your due diligence and mitigation. Then revisit.';
    } else {
      rec = 'DO NOT PROCEED';
      reasoning = 'Your analysis is incomplete. You haven\'t thought through the downside thoroughly enough.';
    }

    setRecommendation({ rec, reasoning, score, gaps });
    setCurrentStep(6);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          formData,
          recommendation
        })
      });

      if (response.ok) {
        // Generate PDF download
        generatePDF();
        setSubmitted(true);
      } else {
        alert('Error submitting. Please try again.');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  const generatePDF = () => {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    pdf.setFontSize(20);
    pdf.text('Binghatti', 20, yPosition);
    yPosition += 8;

    pdf.setFontSize(11);
    pdf.text('Dubai Real Estate Investment Advisory', 20, yPosition);
    yPosition += 6;

    pdf.setFontSize(9);
    pdf.text('Advisor: Rony Hecker, Senior Sales Manager | +971 589054735', 20, yPosition);
    yPosition += 12;

    // Title
    pdf.setFontSize(16);
    pdf.text('Dubai Off-Plan Investment Decision', 20, yPosition);
    yPosition += 8;

    pdf.setFontSize(9);
    pdf.text('Generated: ' + new Date().toLocaleDateString(), 20, yPosition);
    yPosition += 12;

    // Recommendation box
    pdf.setFillColor(245, 245, 245);
    pdf.rect(20, yPosition, pageWidth - 40, 30, 'F');
    pdf.setFontSize(12);
    pdf.setTextColor(37, 99, 235);
    pdf.text('RECOMMENDATION: ' + recommendation.rec, 25, yPosition + 8);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    const recText = pdf.splitTextToSize(recommendation.reasoning, pageWidth - 50);
    pdf.text(recText, 25, yPosition + 16);
    yPosition += 35;

    // Profile section
    pdf.setFontSize(12);
    pdf.text('YOUR INVESTOR PROFILE', 20, yPosition);
    yPosition += 8;

    const profileMap = {
      goal: { income: 'Rental income', appreciation: 'Capital appreciation', combined: 'Both' },
      risk: { conservative: 'Conservative', moderate: 'Moderate', aggressive: 'Aggressive' },
      timeline: { short: '3-5 years', medium: '5-10 years', long: '10+ years' },
      capital: { small: 'AED 250k-500k', medium: 'AED 500k-1.5M', large: 'AED 1.5M+' }
    };

    pdf.setFontSize(9);
    pdf.text('Goal: ' + profileMap.goal[profile.goal], 20, yPosition);
    yPosition += 6;
    pdf.text('Risk: ' + profileMap.risk[profile.risk], 20, yPosition);
    yPosition += 6;
    pdf.text('Timeline: ' + profileMap.timeline[profile.timeline], 20, yPosition);
    yPosition += 6;
    pdf.text('Capital: ' + profileMap.capital[profile.capital], 20, yPosition);
    yPosition += 12;

    // OOCEMR Analysis
    pdf.setFontSize(12);
    pdf.text('OOCEMR ANALYSIS', 20, yPosition);
    yPosition += 8;

    const sections = [
      { title: '1. Outcomes', content: formData.outcomeChosen + ' (' + formData.outcomeWhy + ')' },
      { title: '2. Option A (Primary)', content: formData.optionA },
      { title: '3. Worst Case', content: formData.downside },
      { title: '4. Probability', content: formData.probDownside + '% | Can absorb: ' + formData.canSurvive },
      { title: '5. Mitigation', content: formData.dueDiligence }
    ];

    pdf.setFontSize(10);
    sections.forEach((section) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.setFont(undefined, 'bold');
      pdf.text(section.title, 20, yPosition);
      yPosition += 6;
      pdf.setFont(undefined, 'normal');
      const wrappedText = pdf.splitTextToSize(section.content, pageWidth - 40);
      pdf.text(wrappedText, 20, yPosition);
      yPosition += wrappedText.length * 5 + 4;
    });

    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 20;
    }

    // Score
    pdf.setFontSize(11);
    pdf.text('Framework Score: ' + recommendation.score + '/100', 20, yPosition);
    yPosition += 12;

    // Footer
    pdf.setFontSize(8);
    pdf.text('This decision summary is confidential and prepared for advisory purposes only.', 20, pageHeight - 10);
    pdf.text('Binghatti | Rony Hecker | +971 589054735', 20, pageHeight - 5);

    pdf.save('Dubai-Investment-Decision-' + new Date().toISOString().split('T')[0] + '.pdf');
  };

  // STEP 0: PROFILE
  if (currentStep === 0) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Dubai Off-Plan Investment Decision</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>Investor profiling + OOCEMR framework</p>
        </div>

        <div style={{ backgroundColor: '#f5f5f5', padding: '30px', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Who are you as an investor?</h2>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '12px' }}>Primary Goal</label>
            {['income', 'appreciation', 'combined'].map((opt) => (
              <label key={opt} style={{ display: 'block', marginBottom: '8px', cursor: 'pointer' }}>
                <input type="radio" name="goal" value={opt} onChange={(e) => handleProfileSelect('goal', e.target.value)} />
                {' ' + (opt === 'income' ? 'Rental income (cash flow)' : opt === 'appreciation' ? 'Capital appreciation' : 'Both')}
              </label>
            ))}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '12px' }}>Risk Tolerance</label>
            {['conservative', 'moderate', 'aggressive'].map((opt) => (
              <label key={opt} style={{ display: 'block', marginBottom: '8px', cursor: 'pointer' }}>
                <input type="radio" name="risk" value={opt} onChange={(e) => handleProfileSelect('risk', e.target.value)} />
                {' ' + (opt.charAt(0).toUpperCase() + opt.slice(1))}
              </label>
            ))}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '12px' }}>Dubai Experience</label>
            {['first-time', 'repeat'].map((opt) => (
              <label key={opt} style={{ display: 'block', marginBottom: '8px', cursor: 'pointer' }}>
                <input type="radio" name="experience" value={opt} onChange={(e) => handleProfileSelect('experience', e.target.value)} />
                {' ' + (opt === 'first-time' ? 'First-time investor in Dubai' : 'I\'ve invested in Dubai before')}
              </label>
            ))}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Investment Timeline</label>
            <select onChange={(e) => handleProfileSelect('timeline', e.target.value)} style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid #ddd' }}>
              <option value="">Select...</option>
              <option value="short">3-5 years</option>
              <option value="medium">5-10 years</option>
              <option value="long">10+ years</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Capital Prepared</label>
            <select onChange={(e) => handleProfileSelect('capital', e.target.value)} style={{ padding: '10px', width: '100%', borderRadius: '4px', border: '1px solid #ddd' }}>
              <option value="">Select...</option>
              <option value="small">AED 250k-500k</option>
              <option value="medium">AED 500k-1.5M</option>
              <option value="large">AED 1.5M+</option>
            </select>
          </div>

          <button onClick={startFramework} style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
            Continue to Decision Framework
          </button>
        </div>
      </div>
    );
  }

  // STEP 1: OUTCOMES
  if (currentStep === 1) {
    return (
      <FormStep title="Step 1 of 6: Outcomes" desc="What outcome are you targeting?" onNext={() => goToStep(2)}>
        <input
          type="text"
          placeholder="State your specific goal"
          value={formData.outcomeChosen}
          onChange={(e) => handleFormChange('outcomeChosen', e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <textarea
          placeholder="Why does this matter to you?"
          value={formData.outcomeWhy}
          onChange={(e) => handleFormChange('outcomeWhy', e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' }}
        />
      </FormStep>
    );
  }

  // STEP 2: OPTIONS
  if (currentStep === 2) {
    return (
      <FormStep title="Step 2 of 6: Options" desc="What are you choosing between?" onNext={() => goToStep(3)} onBack={() => goToStep(1)}>
        <textarea
          placeholder="Option A: The one you're leaning toward"
          value={formData.optionA}
          onChange={(e) => handleFormChange('optionA', e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }}
        />
        <input
          type="text"
          placeholder="Option B: What you'd do instead"
          value={formData.optionB}
          onChange={(e) => handleFormChange('optionB', e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <input
          type="text"
          placeholder="Option C: The uncomfortable one"
          value={formData.optionC}
          onChange={(e) => handleFormChange('optionC', e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </FormStep>
    );
  }

  // STEP 3: CONSEQUENCES
  if (currentStep === 3) {
    return (
      <FormStep title="Step 3 of 6: Consequences" desc="What happens with Option A?" onNext={() => goToStep(4)} onBack={() => goToStep(2)}>
        <textarea
          placeholder="Best case scenario"
          value={formData.upside}
          onChange={(e) => handleFormChange('upside', e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }}
        />
        <select
          value={formData.downside}
          onChange={(e) => handleFormChange('downside', e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="">Select worst case scenario...</option>
          <option value="delay-18mo">Construction delays 18-24 months + rental softness</option>
          <option value="developer-crisis">Developer hits liquidity issues</option>
          <option value="oversupply">Market oversupply → rental yield drops</option>
          <option value="geopolitical">Regional instability continues</option>
          <option value="rate-environment">Mortgage rates stay high</option>
          <option value="custom">Something else</option>
        </select>
        {formData.downside === 'custom' && (
          <textarea
            placeholder="Describe your worst case"
            value={formData.downsideCustom}
            onChange={(e) => handleFormChange('downsideCustom', e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }}
          />
        )}
        <select
          value={formData.impact}
          onChange={(e) => handleFormChange('impact', e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="">Financial impact...</option>
          <option value="lose-10">Lose 10% of capital</option>
          <option value="lose-20">Lose 20% of capital</option>
          <option value="lose-30">Lose 30% of capital</option>
          <option value="negative-24mo">Negative cash flow for 24 months</option>
        </select>
      </FormStep>
    );
  }

  // STEP 4: EVALUATE
  if (currentStep === 4) {
    return (
      <FormStep title="Step 4 of 6: Evaluate" desc="What's the realistic probability?" onNext={() => goToStep(5)} onBack={() => goToStep(3)}>
        <label style={{ display: 'block', marginBottom: '16px' }}>
          Probability worst case happens (%):
          <input
            type="number"
            min="0"
            max="100"
            value={formData.probDownside}
            onChange={(e) => handleFormChange('probDownside', parseInt(e.target.value))}
            style={{ width: '80px', padding: '8px', marginLeft: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          %
        </label>
        <select
          value={formData.canSurvive}
          onChange={(e) => handleFormChange('canSurvive', e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="">Can you survive that financially?</option>
          <option value="easily">Yes, easily</option>
          <option value="tight">Yes, but it'll be tight</option>
          <option value="no">No, it would hurt</option>
        </select>
      </FormStep>
    );
  }

  // STEP 5: MITIGATE
  if (currentStep === 5) {
    return (
      <FormStep title="Step 5 of 6: Mitigate" desc="How will you reduce downside?" onNext={generateRecommendation} onBack={() => goToStep(4)}>
        <textarea
          placeholder="Your pre-commitment due diligence"
          value={formData.dueDiligence}
          onChange={(e) => handleFormChange('dueDiligence', e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }}
        />
        <textarea
          placeholder="Your financial backup plan"
          value={formData.mitigation}
          onChange={(e) => handleFormChange('mitigation', e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '60px' }}
        />
        <select
          value={formData.timelineCommit}
          onChange={(e) => handleFormChange('timelineCommit', e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '16px', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          <option value="">When will you decide?</option>
          <option value="30days">Within 30 days</option>
          <option value="60days">Within 60 days</option>
          <option value="contingent">Only after specific milestone</option>
        </select>
      </FormStep>
    );
  }

  // STEP 6: RESULT
  if (currentStep === 6 && recommendation) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Your Recommendation</h1>
        </div>

        {!submitted && (
          <div style={{ backgroundColor: '#f5f5f5', padding: '30px', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: recommendation.rec.includes('MOVE') ? '#16a34a' : recommendation.rec.includes('WAIT') ? '#ea580c' : '#dc2626', marginBottom: '16px' }}>
              {recommendation.rec}
            </div>
            <p style={{ fontSize: '16px', color: '#333', marginBottom: '24px', lineHeight: '1.6' }}>
              {recommendation.reasoning}
            </p>

            {recommendation.gaps.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '12px', color: '#333' }}>Gaps to close:</h3>
                {recommendation.gaps.map((gap, i) => (
                  <div key={i} style={{ backgroundColor: '#fef3c7', borderLeft: '3px solid #f59e0b', padding: '12px', marginBottom: '8px', borderRadius: '4px', fontSize: '14px' }}>
                    {gap}
                  </div>
                ))}
              </div>
            )}

            <div style={{ backgroundColor: '#f0f0f0', padding: '16px', borderRadius: '4px', marginBottom: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a' }}>Framework Score: {recommendation.score}/100</div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '14px 32px',
                borderRadius: '4px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Submitting...' : 'Generate & Download Summary'}
            </button>
          </div>
        )}

        {submitted && (
          <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', padding: '30px', borderRadius: '8px', textAlign: 'center' }}>
            <h2 style={{ color: '#16a34a', marginBottom: '12px' }}>✓ Decision submitted</h2>
            <p style={{ fontSize: '16px', color: '#333', marginBottom: '16px' }}>Your recommendation has been sent and your PDF is ready.</p>
            <p style={{ color: '#666', fontSize: '14px' }}>Ready to discuss with your advisor?</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}

function FormStep({ title, desc, onNext, onBack, children }) {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '20px', marginBottom: '8px' }}>{title}</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>{desc}</p>
      </div>

      <div style={{ backgroundColor: '#f5f5f5', padding: '30px', borderRadius: '8px' }}>
        {children}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                backgroundColor: 'transparent',
                color: '#2563eb',
                padding: '10px 20px',
                borderRadius: '4px',
                border: '1px solid #2563eb',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Back
            </button>
          )}
          <button
            onClick={onNext}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
