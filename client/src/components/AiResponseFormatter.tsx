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
        // 直接将 ** 替换为 HTML 的 strong 标签
        let processed = input.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // 处理编号列表
        processed = processed.replace(/(\d+)\.\s*<strong>/g, '$1. <strong>');

        // 处理破折号
        processed = processed.replace(/(\w)-(\w)/g, '$1 - $2');

        // 确保冒号后有空格
        processed = processed.replace(/:/g, ': ');

        // 添加段落分隔
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
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 text-base leading-relaxed" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 mt-2 space-y-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 mt-2 space-y-2" {...props} />,
                    li: ({node, ...props}) => <li className="mb-2" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                    em: ({node, ...props}) => <em className="italic" {...props} />,
                }}
            >
                {formattedText}
            </ReactMarkdown>
        </div>
    );
};

export default AiResponseFormatter;