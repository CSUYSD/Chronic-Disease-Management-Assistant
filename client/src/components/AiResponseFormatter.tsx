import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

interface AiResponseFormatterProps {
    text: string;
}

const AiResponseFormatter: React.FC<AiResponseFormatterProps> = ({ text }) => {
    const unescapeMarkdown = (text: string): string => {
        return text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'");
    };

    const formatText = (input: string): string => {
        let formatted = input;
        // 确保段落之间有空行
        formatted = formatted.replace(/\n{3,}/g, '\n\n');
        // 确保列表项正确换行
        formatted = formatted.replace(/^(-|\d+\.)\s*/gm, '\n$&');
        // 确保代码块前后有空行
        formatted = formatted.replace(/```[\s\S]*?```/g, match => '\n' + match + '\n');
        return formatted;
    };

    const formattedText = formatText(unescapeMarkdown(text));

    return (
        <div className="ai-response prose prose-sm max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 text-base leading-relaxed" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 mt-2 space-y-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 mt-2 space-y-2" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    a: ({node, ...props}) => <a className="text-blue-600 hover:underline" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                    em: ({node, ...props}) => <em className="italic" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />,
                    code({node, inline, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <SyntaxHighlighter
                                style={tomorrow}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-md overflow-hidden my-4"
                                {...props}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code className="bg-gray-100 rounded px-1 py-0.5" {...props}>
                                {children}
                            </code>
                        )
                    },
                    img: ({node, ...props}) => <img className="max-w-full h-auto my-4 rounded-lg" {...props} alt={props.alt || ''} />,
                    table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="min-w-full divide-y divide-gray-300" {...props} /></div>,
                    th: ({node, ...props}) => <th className="px-3 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />,
                    td: ({node, ...props}) => <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500" {...props} />,
                }}
            >
                {formattedText}
            </ReactMarkdown>
        </div>
    );
};

export default AiResponseFormatter;