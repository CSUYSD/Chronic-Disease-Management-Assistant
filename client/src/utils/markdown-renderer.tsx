import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
    const components: Partial<Components> = {
        // 标题样式
        h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 break-words" {...props} />
        ),
        h2: ({ node, ...props }) => (
            <h2 className="text-xl font-semibold mt-5 mb-3 text-gray-900 break-words" {...props} />
        ),
        h3: ({ node, ...props }) => (
            <h3 className="text-lg font-medium mt-4 mb-2 text-gray-900 break-words" {...props} />
        ),

        // 段落和列表样式
        p: ({ node, ...props }) => (
            <p className="mb-4 text-gray-700 leading-relaxed break-words whitespace-pre-wrap" {...props} />
        ),
        ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 mb-4 text-gray-700 space-y-2" {...props} />
        ),
        ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-5 mb-4 text-gray-700 space-y-2" {...props} />
        ),
        li: ({ node, ...props }) => (
            <li className="mb-1 text-gray-700" {...props} />
        ),

        // 强调样式
        strong: ({ node, ...props }) => (
            <strong className="font-semibold text-gray-900" {...props} />
        ),

        // 代码块样式
        code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
                <div className="my-4 rounded-md overflow-hidden">
                    <SyntaxHighlighter
                        style={tomorrow}
                        language={match[1]}
                        PreTag="div"
                        className="text-sm"
                        customStyle={{
                            margin: 0,
                            borderRadius: '6px',
                        }}
                        {...props}
                    >
                        {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                </div>
            ) : (
                <code className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 text-sm font-mono" {...props}>
                    {children}
                </code>
            );
        },

        // 表格样式
        table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4 rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200" {...props} />
            </div>
        ),
        thead: ({ node, ...props }) => (
            <thead className="bg-gray-50" {...props} />
        ),
        th: ({ node, ...props }) => (
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />
        ),
        td: ({ node, ...props }) => (
            <td className="px-4 py-3 text-sm text-gray-500 border-t border-gray-200" {...props} />
        ),

        // 引用样式
        blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-200 pl-4 my-4 italic text-gray-600" {...props} />
        ),
    };

    return (
        <div className={`markdown-content overflow-y-auto break-words ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={components}
                className="max-w-full"
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;