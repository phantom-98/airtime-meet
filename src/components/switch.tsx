'use client';

const Switch = ({
    value, onToggle
}: {
    value: boolean,
    onToggle: (value: boolean) => void
}) => {

    return (
        <div onClick={() => {
            onToggle(!value);
        }} className="w-12 aspect-video rounded-full bg-blue-400 p-[2px] cursor-pointer relative"
            style={value ? undefined : {
                background: 'gray',
            }}>
            <div className="top-[2px] bottom-[2px] aspect-square rounded-full bg-white absolute transition-all duration-150 ease-in-out"
                style={value ? {
                    right: 2
                } : {
                    left: 2
                }}></div>
        </div>
    )
}

export default Switch