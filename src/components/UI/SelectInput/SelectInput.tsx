import styles from  './SelectInput.module.scss';
export const SelectInput = ({ label, name, options, value, onChange, required = false }: any) => (
    <div className={styles.inputSection}>
        <label htmlFor={name}>
            {label} {required && <span className={styles.required}>*</span>}
        </label>
        <select className={styles.selectInput} name={name} id={name} value={value} onChange={onChange}>
            <option value="">Select</option>
            {options.map((option: string) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    </div>
);