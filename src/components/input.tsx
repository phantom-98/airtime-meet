'use client';

type InputProps = {
    text: string,
    onChange: (text: string) => void
}

// input name
const Input = ({text, onChange}: InputProps) => {
    return (
        <div className="w-fit relative">
            <input
                maxLength={60}
                value={text} onChange={e => onChange(e.target.value)} placeholder="Your name"
                className="w-72 h-14 border border-gray-400 rounded-lg px-4 py-2 outline-(--primary-color)"/>
            <span className="absolute right-4 top-full text-gray-400">{text.length}/60</span>
        </div>
    )
}

export default Input;