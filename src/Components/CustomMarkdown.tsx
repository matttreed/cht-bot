import '../../app/globals.css';
import Markdown from 'react-markdown'
import Image from 'next/image'
import YoutubeIFrame from './YoutubeIFrame';
// import rehypeRaw from 'rehype-raw';
// import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter/dist/cjs';
// import {oneLight} from 'react-syntax-highlighter/dist/cjs/styles/prism';
// import YouTubeIFrame from "./YoutubeIFrame";

export default function CustomMarkDown({ content, className }:{content: string, className: string}) {
  return (<>
    <Markdown
        // rehypePlugins={[rehypeRaw]}
        className={"text-lg break-words " + className}
        components={{
            p(props) {
                const { node, ...rest } = props;
                return <p className='mb-6' {...rest} />
            },
            img(props) {
                console.log("woah here")
                const { node, ...rest } = props;
                const alt = String(node?.properties.alt);
                const link = String(node?.properties.src);
                console.log(link)
                return (
                    <div className="mb-6">
                        <YoutubeIFrame
                            videoURL={link}
                            title={alt}
                        />
                    </div>
                )
            },
            // code(props) {
            //     const {children, className, node, ...rest} = props
            //     const match = /language-(\w+)/.exec(className || '')
            //     return match ? (
            //       <SyntaxHighlighter
            //         {...rest}
            //         PreTag="div"
            //         children={String(children).replace(/\n$/, '')}
            //         language={match[1]}
            //         style={oneLight}
            //         showLineNumbers={true}
            //         className="text-sm mb-6"
            //       />
            //     ) : (
            //       <code {...rest} className={className}>
            //         {children}
            //       </code>
            //     )
            // },
            a(props) {
                const { node, ...rest } = props;
                return <a className='text-sky-600 hover:text-sky-800' target='_blank' {...rest} />
            },
            h1(props) {
                const { node, ...rest } = props;
                return <h1 className='text-4xl mb-6' {...rest} />
            },
            h2(props) {
                const { node, ...rest } = props;
                return <h2 className='text-3xl mb-6' {...rest} />
            },
            h3(props) {
                const { node, ...rest } = props;
                return <h3 className='text-2xl mb-6' {...rest} />
            },
            blockquote(props){
                const { node, ...rest } = props;
                return <blockquote className='text-2xl mb-6 font-sans' {...rest} />
            },
            ol(props){
                const { node, ...rest } = props;
                return <ol className='list-decimal list-inside' {...rest} />
            },
            ul(props){
                const { node, ...rest } = props;
                return <ul className='list-disc list-inside' {...rest} />
            },
            li(props){
                const { node, ...rest } = props;
                return <li className='mb-6' {...rest} />
            }
        }}
    >
        {content}
    </Markdown>
    </>)
}