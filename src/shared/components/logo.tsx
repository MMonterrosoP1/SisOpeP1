import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function LogoIcon({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center justify-center shrink-0", className)}>
      <Image
        src="/SVG/premed-part1-light.svg"
        alt="PREMED Icon"
        width={100}
        height={100}
        className="dark:hidden object-contain w-auto h-full"
        priority
      />
      <Image
        src="/SVG/premed-part1-dark.svg"
        alt="PREMED Icon"
        width={100}
        height={100}
        className="hidden dark:block object-contain w-auto h-full"
        priority
      />
    </div>
  );
}

export function LogoFull({ className, iconClassName, textClassName }: LogoProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      {/* Parte 1: Isotipo */}
      <div className={cn("shrink-0 h-full", iconClassName)}>
        <Image
          src="/SVG/premed-part1-light.svg"
          alt="PREMED Icon"
          width={100}
          height={100}
          className="dark:hidden object-contain w-auto h-full"
          priority
        />
        <Image
          src="/SVG/premed-part1-dark.svg"
          alt="PREMED Icon"
          width={100}
          height={100}
          className="hidden dark:block object-contain w-auto h-full"
          priority
        />
      </div>

      {/* Parte 2: Texto */}
      <div className={cn("shrink-0 h-full flex items-center ", textClassName)}>
        <Image
          src="/SVG/premed-part2-light.svg"
          alt="PREMED"
          width={300}
          height={100}
          className="dark:hidden object-contain w-auto h-full"
          priority
        />
        <Image
          src="/SVG/premed-part2-dark.svg"
          alt="PREMED"
          width={300}
          height={100}
          className="hidden dark:block object-contain w-auto h-full"
          priority
        />
      </div>
    </div>
  );
}
