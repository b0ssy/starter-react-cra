import { useState } from "react";
import moment from "moment";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import IconButton from "./IconButton";

export interface DatePickerProps {
  initialDisplayDate?: Date;
  selectedDate?: Date;
  onChange?: (date: Date) => void;
}

export default function DatePicker(props: DatePickerProps) {
  const [displayDate, setDisplayDate] = useState(
    moment(props.initialDisplayDate ?? new Date())
  );

  const startOfMonth = displayDate.clone().startOf("month");
  const daysInMonth: number[] = Array.from(
    new Array(displayDate.daysInMonth() + startOfMonth.weekday())
  ).map((_, index) => index - startOfMonth.weekday());
  if (daysInMonth.length % 7 > 0) {
    const end = 7 - (daysInMonth.length % 7);
    for (let i = 0; i < end; i++) {
      daysInMonth.push(daysInMonth[daysInMonth.length - 1] + 1);
    }
  }
  return (
    <div className="inline-block paper divider-border px-6 py-4 w-96">
      {/* Header */}
      <div className="flex flex-row items-center">
        {/* Navigate to previous month */}
        <IconButton
          className="w-5 h-5 ml-2"
          onClick={() => {
            const newDate = displayDate.clone().subtract(1, "month");
            setDisplayDate(newDate);
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        {/* Month/year title */}
        <span className="flex-grow text text-center">
          {displayDate.format("MMMM YYYY")}
        </span>

        {/* Navigate to next month */}
        <IconButton
          className="mr-2"
          onClick={() => {
            const newDate = displayDate.clone().add(1, "month");
            setDisplayDate(newDate);
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </div>

      {/* Weekdays title */}
      <div className="flex flex-row items-center mt-3">
        {Array.from(new Array(7)).map((_, index) => (
          <span key={index} className="flex-1 text text-dim text-center p-2">
            {moment().startOf("week").add(index, "days").format("ddd")}
          </span>
        ))}
      </div>

      {/* Days */}
      {Array.from(new Array(Math.ceil(daysInMonth.length / 7))).map(
        (_, weekIndex) => (
          <div key={weekIndex} className="flex flex-row items-center">
            {Array.from(new Array(7)).map((_, dayOfWeekIndex) => {
              const dayInMonth = daysInMonth[weekIndex * 7 + dayOfWeekIndex];
              const currDate = startOfMonth.clone().add(dayInMonth, "days");

              const classes = [
                "flex justify-center items-center text text-center w-8 h-8 group-hover:bg-primary-300 dark:group-hover:text-base-800 ring-1 transition",
              ];

              const outsideMonth = !currDate.isSame(displayDate, "month");
              if (outsideMonth) {
                classes.push("text-disabled");
              }

              if (props.selectedDate) {
                const isSelected = currDate.isSame(props.selectedDate, "day");
                if (isSelected) {
                  classes.push("bg-primary-300 dark:bg-primary-200 dark:text-base-800");
                }
              }

              const isToday = currDate.isSame(moment(), "day");
              if (isToday) {
                classes.push("ring-base-400");
              } else {
                classes.push("ring-transparent");
              }
              return (
                <div
                  key={`${displayDate.month()}-${dayInMonth}`}
                  className="group flex flex-1 w-8 h-8 m-1 justify-center items-center cursor-pointer"
                  onClick={() => {
                    if (props.onChange) {
                      props.onChange(currDate.toDate());
                    }
                  }}
                >
                  <span className={classes.join(" ")}>
                    {currDate.format("D")}
                  </span>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
