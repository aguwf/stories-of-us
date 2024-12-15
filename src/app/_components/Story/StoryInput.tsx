import { Input } from "@nextui-org/react";

interface StoryInputProps {
	label: string;
	name: string;
	placeholder: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	className?: string;
	error?: string;
}

const StoryInput = ({
	label,
	name,
	placeholder,
	value,
	onChange,
	className,
	error,
}: StoryInputProps) => {
	return (
		<Input
			label={label}
			name={name}
			placeholder={placeholder}
			value={value}
			onChange={onChange}
			className={className}
			errorMessage={error}
		/>
	);
};

export default StoryInput;
