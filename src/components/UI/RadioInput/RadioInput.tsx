import styles from './RadioInput.module.scss';
export const RadioInput = ({ label, name, value, checked, onChange }: any) => (
    <div className={styles.inputSection}>
        <label htmlFor={value}>
            {label} <span className={styles.required}>*</span>
        </label>
        <input
            type="radio"
            id={value}
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
        />
    </div>
);