'use client';

type ButtonProps = {
    text: string,
    spinner?: boolean,
    disabled?: boolean,
    onClick: () => void,
}

const Button = ({text, spinner = false, disabled, onClick}: ButtonProps) => {
    return (
        <button onClick={onClick} disabled={disabled} className="w-60 h-14 cursor-pointer rounded-full transition-all duration-200 ease-in-out text-lg font-bold flex items-center justify-center button">
            {spinner && <div className="size-5 border-[3px] mr-4 border-gray-300 border-t-gray-100 animate-spin rounded-full inline-block"></div>}
            <span>{text}</span>
        </button>
    )
}

export default Button;