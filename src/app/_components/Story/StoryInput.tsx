import { Input } from "@nextui-org/react";

interface StoryInputProps {
    label: string;
    name: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const StoryInput = ({ label, name, placeholder, value, onChange }: StoryInputProps) => {
    return (
        <Input
            label={label}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
    );
};

export default StoryInput;