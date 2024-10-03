import { Component, computed, effect, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { deepMirror, mirror } from './utils/mirror';
import './utils/deep-signal';
import { nest } from './utils/deep-signal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'reactive-helpers';

  data = signal({ x: 1, y: { z: 2, a: 1 } });
  readOnly = this.data.asReadonly();
  mirrored = mirror(this.readOnly);

  projected = computed(() => this.mirrored().x * 2);

  nested = nest(this.data());

  cn = deepMirror(this.data);

  constructor() {
    effect(() => {
      console.log('computedNested', this.cn().y().z());
    });

    setTimeout(() => {
      this.cn().y().z.set(17);
    });
    setTimeout(() => {
      this.data.update((data) => ({
        ...data,
        y: {
          ...data.y,
          z: 18,
        },
      }));
    });
  }
}
