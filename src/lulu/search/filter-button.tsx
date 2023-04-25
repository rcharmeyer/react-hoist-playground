import { useFilterStoreBy } from "./filter"

export function FilterButton (props: {
  filter: string
}) {
  const { filtered, toggleFilter } = useFilterStoreBy (props.filter)
  
  let buttonClass = "border"
  if (filtered) buttonClass += " border-gray-500"
  else buttonClass += " border-gray-300"
  
  return (
    <button className={buttonClass} type="button" onClick={toggleFilter}>
      {props.filter}
    </button>
  )
}