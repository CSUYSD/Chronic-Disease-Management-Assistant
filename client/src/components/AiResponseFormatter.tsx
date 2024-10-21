import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';

interface AiResponseFormatterProps {
    text: string;
}

const AiResponseFormatter: React.FC<AiResponseFormatterProps> = ({ text }) => {
    const preprocessText = (input: string): string => {
        // Remove any existing HTML tags
        let processed = input.replace(/<[^>]*>/g, '');

        // Handle code blocks
        processed = processed.replace(/```([\s\S]*?)```/g, (match, p1) => '```\n' + p1.trim() + '\n```');

        // Handle inline code
        processed = processed.replace(/`([^`]+)`/g, '`$1`');

        // Handle bold text
        processed = processed.replace(/\*\*([^*]+)\*\*/g, '**$1**');

        // Handle italic text
        processed = processed.replace(/\*([^*]+)\*/g, '*$1*');

        // Handle numbered lists
        processed = processed.replace(/(\d+)\.\s*/g, '$1. ');

        // Handle unordered lists
        processed = processed.replace(/^-\s*/gm, '- ');

        // Handle hyphens
        processed = processed.replace(/(\w)-(\w)/g, '$1 - $2');

        // Ensure colon is followed by a space
        processed = processed.replace(/:/g, ': ');

        // Add paragraph separation
        processed = processed.replace(/\.\s+/g, '.\n\n');

        return processed;
    };

    const formattedText = preprocessText(text);

    return (
        <div className="ai-response">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-5 mb-2" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 text-base leading-relaxed" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 mt-2 space-y-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 mt-2 space-y-2" {...props} />,
                    li: ({node, ...props}) => <li className="mb-2" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                    em: ({node, ...props}) => <em className="italic" {...props} />,
                    code: ({ node, inline, className, children, ...props }: any) =>
                        inline ? (
                            <code className="bg-gray-100 rounded px-1 py-0.5" {...props}>
                                {children}
                            </code>
                        ) : (
                            <code className="block bg-gray-100 rounded p-4 my-4 whitespace-pre-wrap" {...props}>
                                {children}
                            </code>
                        ),
                }}
            >
                {formattedText}
            </ReactMarkdown>
        </div>
    );
};

export default AiResponseFormatter;