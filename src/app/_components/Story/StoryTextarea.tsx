import { Textarea } from "@nextui-org/react";

interface StoryTextareaProps {
    label: string;
    name: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const StoryTextarea = ({ label, name, placeholder, value, onChange }: StoryTextareaProps) => {
    return (
        <Textarea
            label={label}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
    );
};

export default StoryTextarea;