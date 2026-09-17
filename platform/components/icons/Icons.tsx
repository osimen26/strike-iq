import React from "react";
import { BoltIcon } from "@solar-icons/react/line-duotone/bolt";
import { ChartIcon } from "@solar-icons/react/line-duotone/chart";
import { CupFirstIcon } from "@solar-icons/react/line-duotone/cup-first";
import { UserIcon as SolarUserIcon } from "@solar-icons/react/line-duotone/user";
import { CrownIcon as SolarCrownIcon } from "@solar-icons/react/line-duotone/crown";
import { SettingsIcon as SolarSettingsIcon } from "@solar-icons/react/line-duotone/settings";
import { UsersGroupTwoRoundedIcon } from "@solar-icons/react/line-duotone/users-group-two-rounded";
import { LockPasswordIcon } from "@solar-icons/react/line-duotone/lock-password";
import { MagicWandIcon } from "@solar-icons/react/line-duotone/magic-wand";
import { ShieldCheckIcon as SolarShieldCheckIcon } from "@solar-icons/react/line-duotone/shield-check";
import { CheckCircleIcon as SolarCheckCircleIcon } from "@solar-icons/react/line-duotone/check-circle";
import { CloseCircleIcon } from "@solar-icons/react/line-duotone/close-circle";
import { TicketIcon as SolarTicketIcon } from "@solar-icons/react/line-duotone/ticket";
import { AltArrowLeftIcon } from "@solar-icons/react/line-duotone/alt-arrow-left";
import { CopyIcon as SolarCopyIcon } from "@solar-icons/react/line-duotone/copy";
import { TrashBinTrashIcon } from "@solar-icons/react/line-duotone/trash-bin-trash";
import { RestartIcon } from "@solar-icons/react/line-duotone/restart";
import { TargetIcon as SolarTargetIcon } from "@solar-icons/react/line-duotone/target";
import { GiftIcon as SolarGiftIcon } from "@solar-icons/react/line-duotone/gift";
import { HourglassIcon as SolarHourglassIcon } from "@solar-icons/react/line-duotone/hourglass";
import { InfoCircleIcon } from "@solar-icons/react/line-duotone/info-circle";
import { ClockCircleIcon } from "@solar-icons/react/line-duotone/clock-circle";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export function ZapIcon(props: IconProps) { return <BoltIcon {...props as any} />; }
export function ChartBarIcon(props: IconProps) { return <ChartIcon {...props as any} />; }
export function TrophyIcon(props: IconProps) { return <CupFirstIcon {...props as any} />; }
export function UserIcon(props: IconProps) { return <SolarUserIcon {...props as any} />; }
export function CrownIcon(props: IconProps) { return <SolarCrownIcon {...props as any} />; }
export function SettingsIcon(props: IconProps) { return <SolarSettingsIcon {...props as any} />; }
export function UsersIcon(props: IconProps) { return <UsersGroupTwoRoundedIcon {...props as any} />; }
export function LockIcon(props: IconProps) { return <LockPasswordIcon {...props as any} />; }
export function SparklesIcon(props: IconProps) { return <MagicWandIcon {...props as any} />; }
export function ShieldCheckIcon(props: IconProps) { return <SolarShieldCheckIcon {...props as any} />; }
export function CheckCircleIcon(props: IconProps) { return <SolarCheckCircleIcon {...props as any} />; }
export function XCircleIcon(props: IconProps) { return <CloseCircleIcon {...props as any} />; }
export function TicketIcon(props: IconProps) { return <SolarTicketIcon {...props as any} />; }
export function ArrowLeftIcon(props: IconProps) { return <AltArrowLeftIcon {...props as any} />; }
export function CopyIcon(props: IconProps) { return <SolarCopyIcon {...props as any} />; }
export function TrashIcon(props: IconProps) { return <TrashBinTrashIcon {...props as any} />; }
export function RefreshCwIcon(props: IconProps) { return <RestartIcon {...props as any} />; }
export function TargetIcon(props: IconProps) { return <SolarTargetIcon {...props as any} />; }
export function GiftIcon(props: IconProps) { return <SolarGiftIcon {...props as any} />; }
export function HourglassIcon(props: IconProps) { return <SolarHourglassIcon {...props as any} />; }
export function AlertCircleIcon(props: IconProps) { return <InfoCircleIcon {...props as any} />; }
export function ClockIcon(props: IconProps) { return <ClockCircleIcon {...props as any} />; }
