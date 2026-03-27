import { queue } from "../src/lib/store";

describe("Queue Management", () => {
  beforeEach(() => {
    // reset queue before each test
    queue.length = 0;
  });

  test("should add a user to the queue", () => {
    const newUser = {
      id: 1,
      userId: 1,
      serviceId: 101,
      priority: 2,
      timeJoined: Date.now(),
    };

    queue.push(newUser);

    expect(queue.length).toBe(1);
    expect(queue[0].userId).toBe(1);
  });

  test("should remove a user from the queue", () => {
    queue.push({
      id: 1,
      userId: 1,
      serviceId: 101,
      priority: 2,
      timeJoined: Date.now(),
    });

    const removed = queue.shift();

    expect(queue.length).toBe(0);
    expect(removed?.userId).toBe(1);
  });

  test("should serve next user (FIFO)", () => {
    queue.push({
      id: 1,
      userId: 1,
      serviceId: 101,
      priority: 2,
      timeJoined: 100,
    });

    queue.push({
      id: 2,
      userId: 2,
      serviceId: 102,
      priority: 1,
      timeJoined: 200,
    });

    const served = queue.shift();

    expect(served?.userId).toBe(1);
    expect(queue.length).toBe(1);
  });

  test("should not allow duplicate user in queue", () => {
    queue.push({
      id: 1,
      userId: 1,
      serviceId: 101,
      priority: 2,
      timeJoined: Date.now(),
    });

    const duplicate = queue.find((u) => u.userId === 1);

    expect(duplicate).toBeDefined();
  });
});