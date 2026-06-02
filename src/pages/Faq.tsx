import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import './Faq.css';

const FAQ_DATA = [
    {
        id: '1',
        question: 'What is MechSketch?',
        answer: 'MechSketch is an interactive application designed to build, test, and refine robot task sequences within a 3D simulation environment.'
    },
    {
        id: '2',
        question: 'How do I create a project?',
        answer: 'Navigate to the Planner screen, enter a distinct name in the input field "Name your project", and click "Continue to workspace".'
    },
    {
        id: '3',
        question: 'Why isn’t my robot moving?',
        answer: 'Make sure your robot has valid joint states or IK targets assigned and that you have pressed play on the workspace simulation timeline.'
    },
    {
        id: '4',
        question: 'How do I simulate actions?',
        answer: 'Simply click the "Play" button in the task environment after configuring your desired robot states.'
    },
    {
        id: '5',
        question: 'How do I reset my workspace?',
        answer: 'You can clear your current workspace progress by creating a new project from the home page, or deleting specific timeline tasks locally.'
    }
];

export default function Faq() {
    const navigate = useNavigate();
    const [openId, setOpenId] = useState<string | null>(null);

    const toggleOpen = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <div className="faq-container">
            {/* Top Navigation */}
            <div className="faq-nav">
                <button
                    onClick={() => navigate('/settings')}
                    className="faq-back-btn"
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                    <ArrowLeft size={16} />
                    Back to Settings
                </button>
            </div>

            {/* Main Content */}
            <div className="faq-content">
                <div className="faq-header">
                    <h1 className="faq-title">
                        Frequently Asked Questions
                    </h1>
                    <p className="faq-subtitle">
                        Find answers to common questions about using MechSketch
                    </p>
                </div>

                <div className="faq-list">
                    {FAQ_DATA.map((faq) => {
                        const isOpen = openId === faq.id;
                        return (
                            <div key={faq.id} className="faq-item">
                                <button
                                    onClick={() => toggleOpen(faq.id)}
                                    className="faq-question-btn"
                                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                                >
                                    <span className="faq-question-text">
                                        {faq.question}
                                    </span>
                                    <span 
                                        className="faq-chevron"
                                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                    >
                                        <ChevronDown size={18} />
                                    </span>
                                </button>
                                <div 
                                    className="faq-answer-container"
                                    style={{
                                        maxHeight: isOpen ? '200px' : '0',
                                        opacity: isOpen ? 1 : 0,
                                        paddingBottom: isOpen ? 'var(--sys-tokens-spacing-spacing-xl)' : '0'
                                    }}
                                >
                                    <p className="faq-answer-text">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}



