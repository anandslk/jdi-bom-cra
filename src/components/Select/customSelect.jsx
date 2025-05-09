import React from "react";
import { Form } from "react-bootstrap";
import "./customSelect.css";

const CustomSelect = ({
  index,
  selectedValue,
  onChange,
  size,
  className,
  disabled,
  options,
}) => {
  const defaultLabel = options?.defaultLabel || "Please select";
  const list = options?.list || [];

  const handleChange = (e) => {
    // If index is provided use it, otherwise just pass the value
    if (index !== undefined) {
      onChange(index, e.target.value);
    } else {
      onChange(e.target.value);
    }
  };
  // Check if we have grouped options (array of objects with label and options properties)
  const hasGroupedOptions =
    Array.isArray(list) &&
    list.length > 0 &&
    list[0] &&
    "label" in list[0] &&
    "options" in list[0];

  // console.log("CustomSelect received options:", {
  //   list,
  //   hasGroupedOptions,
  //   selectedValue,
  // });

  return (
    <Form.Select
      aria-label="Attribute selection"
      value={selectedValue || ""}
      onChange={handleChange}
      size={size}
      className={className}
    >
      <option value="">{defaultLabel}</option> {/* Default option */}
      {hasGroupedOptions
        ? // Render grouped options with optgroup
          list.map((group, groupIndex) => (
            <optgroup key={`group-${groupIndex}`} label={group.label}>
              {Array.isArray(group.options) &&
                group.options.map((item, optionIndex) => (
                  <option
                    key={`option-${groupIndex}-${optionIndex}`}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
            </optgroup>
          ))
        : // Render flat list of options
          list.map((item, idx) => (
            <option key={`option-${idx}`} value={item.value}>
              {item.label}
            </option>
          ))}
    </Form.Select>
  );
};

export default CustomSelect;
