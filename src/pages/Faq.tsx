import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';


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
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'var(--sys-primitives-colors-neutral-netural-100)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'var(--sys-typography-font-family-font-sans-serif), -apple-system, sans-serif'
        }}>
            {/* Top Navigation */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: 'var(--sys-tokens-spacing-spacing-xl) var(--sys-tokens-spacing-spacing-2xl)'
            }}>
                <button
                    onClick={() => navigate('/settings')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--sys-tokens-spacing-spacing-xs)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 'var(--sys-typography-size-13, 13px)',
                        color: 'var(--sys-primitives-colors-neutral-neutral-700)',
                        padding: 0
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                    <ArrowLeft size={16} />
                    Back to Settings
                </button>
            </div>


            {/* Main Content */}
            <div style={{
                flex: 1,
                width: '100%',
                maxWidth: '600px',
                margin: '0 auto',
                padding: '0 var(--sys-tokens-spacing-spacing-xl) var(--sys-tokens-spacing-spacing-xl)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--sys-tokens-spacing-spacing-xl)' }}>
                    <h1 style={{
                        margin: '0 0 var(--sys-tokens-spacing-spacing-xxs) 0',
                        fontSize: 'var(--sys-typography-size-28, 28px)',
                        fontWeight: 700,
                        color: 'var(--sys-primitives-colors-neutral-neutral-900)',
                        letterSpacing: '-0.5px'
                    }}>
                        Frequently Asked Questions
                    </h1>
                    <p style={{
                        margin: 0,
                        fontSize: 'var(--sys-typography-size-15, 15px)',
                        lineHeight: 1.5,
                        color: 'var(--sys-primitives-colors-neutral-neutral-600)'
                    }}>
                        Find answers to common questions about using MechSketch
                    </p>
                </div>


                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {FAQ_DATA.map((faq) => {
                        const isOpen = openId === faq.id;
                        return (
                            <div
                                key={faq.id}
                                style={{
                                    borderBottom: '1px solid var(--sys-primitives-colors-neutral-neutral-200)',
                                    overflow: 'hidden'
                                }}
                            >
                                <button
                                    onClick={() => toggleOpen(faq.id)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: 'var(--sys-tokens-spacing-spacing-xl) 0 var(--sys-tokens-spacing-spacing-xl) 0',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        color: 'var(--sys-primitives-colors-neutral-neutral-900)'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                                >
                                    <span style={{
                                        fontSize: 'var(--sys-typography-size-15, 15px)',
                                        fontWeight: 500
                                    }}>
                                        {faq.question}
                                    </span>
                                    <span style={{
                                        color: 'var(--sys-primitives-colors-neutral-neutral-500)',
                                        display: 'flex',
                                        transition: 'transform 0.2s',
                                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                    }}>
                                        <ChevronDown size={18} />
                                    </span>
                                </button>
                                <div style={{
                                    maxHeight: isOpen ? '200px' : '0',
                                    opacity: isOpen ? 1 : 0,
                                    transition: 'all 0.3s ease-in-out',
                                    paddingBottom: isOpen ? 'var(--sys-tokens-spacing-spacing-xl)' : '0'
                                }}>
                                    <p style={{
                                        margin: 0,
                                        fontSize: 'var(--sys-typography-size-15, 15px)',
                                        lineHeight: 1.5,
                                        color: 'var(--sys-primitives-colors-neutral-neutral-600)'
                                    }}>
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



