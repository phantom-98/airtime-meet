
import Image from "next/image"
import Brand from '@/assets/icons/brand.svg';

type LogoProps = {
    className?: string
}

const Logo = ({className}: LogoProps) => {
    return (
       <div className={`${className}`}>
            <div className="relative w-full h-fit">
                <Image src={Brand} alt="Airtime" className="w-full h-auto"/>
                <span className="absolute text-[#00A39D] font-semibold top-3/5 left-[105%]">beta</span>
            </div>
       </div>
    )
}

export default Logo;