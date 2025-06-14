import { useDispatch, useSelector } from "react-redux";

import { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import { decrement, increment } from "@/store/slices/counter";

const Counter = () => {
  const dispatch = useDispatch();
  const count = useSelector((state: RootState) => state.counter.value);

  return (
    <div className="flex flex-row justify-center">
      <h1>Profile</h1>

      <div className="flex flex-row gap-2">
        <h2>Counter: {count}</h2>
        <Button onClick={() => dispatch(increment())}>+</Button>
        <Button onClick={() => dispatch(decrement())}>-</Button>
      </div>
    </div>
  );
};

export default Counter;
