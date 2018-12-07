import { LoadAnimationComponent } from '.';

describe('LoadAnimationComponent', () => {
  let component: LoadAnimationComponent;

  beforeEach(() => {
    component = new LoadAnimationComponent();
  });

  it('should update the message', () => {
    component.resources = { res1: true, res2: false, res3: true };
    expect(component.message).toBe('Loading res1, res3...');
  });
});
