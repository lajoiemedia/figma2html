
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var ui = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    class HtmlTag {
        constructor(is_svg = false) {
            this.is_svg = false;
            this.is_svg = is_svg;
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                if (this.is_svg)
                    this.e = svg_element(target.nodeName);
                else
                    this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (!css || typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css_248z$z = "/*! tailwindcss v3.2.0 | MIT License | https://tailwindcss.com*/*,:after,:before{border:0 solid #e5e7eb;box-sizing:border-box}:after,:before{--tw-content:\"\"}html{-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4}body{line-height:inherit;margin:0}hr{border-top-width:1px;color:inherit;height:0}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{border-collapse:collapse;border-color:inherit;text-indent:0}button,input,optgroup,select,textarea{color:inherit;font-family:inherit;font-size:100%;font-weight:inherit;line-height:inherit;margin:0;padding:0}button,select{text-transform:none}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}fieldset{margin:0}fieldset,legend{padding:0}menu,ol,ul{list-style:none;margin:0;padding:0}textarea{resize:vertical}input::-moz-placeholder, textarea::-moz-placeholder{color:#9ca3af;opacity:1}input::placeholder,textarea::placeholder{color:#9ca3af;opacity:1}[role=button],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{height:auto;max-width:100%}[hidden]{display:none}*,:after,:before{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: }::backdrop{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: }.container{width:100%}@media (min-width:640px){.container{max-width:640px}}@media (min-width:768px){.container{max-width:768px}}@media (min-width:1024px){.container{max-width:1024px}}@media (min-width:1280px){.container{max-width:1280px}}@media (min-width:1536px){.container{max-width:1536px}}.pointer-events-none{pointer-events:none}.visible{visibility:visible}.static{position:static}.fixed{position:fixed}.absolute{position:absolute}.relative{position:relative}.sticky{position:sticky}.bottom-0{bottom:0}.right-0{right:0}.top-1\\/2{top:50%}.left-1\\/2{left:50%}.left-0{left:0}.top-0{top:0}.z-\\[999\\]{z-index:999}.z-20{z-index:20}.m-0{margin:0}.mx-2{margin-left:.5rem;margin-right:.5rem}.ml-0\\.5{margin-left:.125rem}.ml-0{margin-left:0}.mr-2{margin-right:.5rem}.mt-2{margin-top:.5rem}.mb-2\\.5{margin-bottom:.625rem}.mb-2{margin-bottom:.5rem}.ml-1{margin-left:.25rem}.mr-0{margin-right:0}.mt-4{margin-top:1rem}.block{display:block}.inline{display:inline}.flex{display:flex}.hidden{display:none}.aspect-square{aspect-ratio:1/1}.h-4{height:1rem}.h-full{height:100%}.h-12{height:3rem}.h-6{height:1.5rem}.h-16{height:4rem}.min-h-full{min-height:100%}.min-h-\\[200px\\]{min-height:200px}.w-4{width:1rem}.w-full{width:100%}.w-1\\/3{width:33.333333%}.w-2\\/3{width:66.666667%}.w-6{width:1.5rem}.w-16{width:4rem}.flex-grow{flex-grow:1}.-translate-x-1\\/4{--tw-translate-x:-25%}.-translate-x-1\\/4,.-translate-y-1\\/4{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-translate-y-1\\/4{--tw-translate-y:-25%}.-translate-x-1\\/2{--tw-translate-x:-50%}.-translate-x-1\\/2,.-translate-y-1\\/2{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-translate-y-1\\/2{--tw-translate-y:-50%}.-rotate-45{--tw-rotate:-45deg}.-rotate-45,.transform{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.cursor-se-resize{cursor:se-resize}.cursor-pointer{cursor:pointer}.resize{resize:both}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.items-center{align-items:center}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.gap-2{gap:.5rem}.gap-4{gap:1rem}.gap-1{gap:.25rem}.overflow-hidden{overflow:hidden}.rounded-full{border-radius:9999px}.rounded{border-radius:.25rem}.rounded-lg{border-radius:.5rem}.rounded-md{border-radius:.375rem}.border{border-width:1px}.bg-white{--tw-bg-opacity:1;background-color:rgb(255 255 255/var(--tw-bg-opacity))}.p-4{padding:1rem}.p-2{padding:.5rem}.py-4{padding-bottom:1rem;padding-top:1rem}.px-\\[11px\\]{padding-left:11px;padding-right:11px}.pb-12{padding-bottom:3rem}.text-xs{font-size:.75rem;line-height:1rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-\\[10px\\]{font-size:10px}.text-base{font-size:1rem;line-height:1.5rem}.font-bold{font-weight:700}.italic{font-style:italic}.text-gray-300{--tw-text-opacity:1;color:rgb(209 213 219/var(--tw-text-opacity))}.opacity-0{opacity:0}.outline{outline-style:solid}.blur{--tw-blur:blur(8px)}.blur,.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.transition-all{transition-duration:.15s;transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1)}.transition{transition-duration:.15s;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,-webkit-backdrop-filter;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter,-webkit-backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1)}.hover\\:opacity-80:hover{opacity:.8}";
    styleInject(css_248z$z);

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function commonjsRequire(path) {
    	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
    }

    var jszip_min = {exports: {}};

    /*!

    JSZip v3.9.1 - A JavaScript class for generating and reading zip files
    <http://stuartk.com/jszip>

    (c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
    Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/master/LICENSE.markdown.

    JSZip uses the library pako released under the MIT license :
    https://github.com/nodeca/pako/blob/master/LICENSE
    */

    (function (module, exports) {
    	!function(t){module.exports=t();}(function(){return function s(a,o,h){function u(r,t){if(!o[r]){if(!a[r]){var e="function"==typeof commonjsRequire&&commonjsRequire;if(!t&&e)return e(r,!0);if(l)return l(r,!0);var i=new Error("Cannot find module '"+r+"'");throw i.code="MODULE_NOT_FOUND",i}var n=o[r]={exports:{}};a[r][0].call(n.exports,function(t){var e=a[r][1][t];return u(e||t)},n,n.exports,s,a,o,h);}return o[r].exports}for(var l="function"==typeof commonjsRequire&&commonjsRequire,t=0;t<h.length;t++)u(h[t]);return u}({1:[function(t,e,r){var c=t("./utils"),d=t("./support"),p="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";r.encode=function(t){for(var e,r,i,n,s,a,o,h=[],u=0,l=t.length,f=l,d="string"!==c.getTypeOf(t);u<t.length;)f=l-u,i=d?(e=t[u++],r=u<l?t[u++]:0,u<l?t[u++]:0):(e=t.charCodeAt(u++),r=u<l?t.charCodeAt(u++):0,u<l?t.charCodeAt(u++):0),n=e>>2,s=(3&e)<<4|r>>4,a=1<f?(15&r)<<2|i>>6:64,o=2<f?63&i:64,h.push(p.charAt(n)+p.charAt(s)+p.charAt(a)+p.charAt(o));return h.join("")},r.decode=function(t){var e,r,i,n,s,a,o=0,h=0,u="data:";if(t.substr(0,u.length)===u)throw new Error("Invalid base64 input, it looks like a data url.");var l,f=3*(t=t.replace(/[^A-Za-z0-9\+\/\=]/g,"")).length/4;if(t.charAt(t.length-1)===p.charAt(64)&&f--,t.charAt(t.length-2)===p.charAt(64)&&f--,f%1!=0)throw new Error("Invalid base64 input, bad content length.");for(l=d.uint8array?new Uint8Array(0|f):new Array(0|f);o<t.length;)e=p.indexOf(t.charAt(o++))<<2|(n=p.indexOf(t.charAt(o++)))>>4,r=(15&n)<<4|(s=p.indexOf(t.charAt(o++)))>>2,i=(3&s)<<6|(a=p.indexOf(t.charAt(o++))),l[h++]=e,64!==s&&(l[h++]=r),64!==a&&(l[h++]=i);return l};},{"./support":30,"./utils":32}],2:[function(t,e,r){var i=t("./external"),n=t("./stream/DataWorker"),s=t("./stream/Crc32Probe"),a=t("./stream/DataLengthProbe");function o(t,e,r,i,n){this.compressedSize=t,this.uncompressedSize=e,this.crc32=r,this.compression=i,this.compressedContent=n;}o.prototype={getContentWorker:function(){var t=new n(i.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")),e=this;return t.on("end",function(){if(this.streamInfo.data_length!==e.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),t},getCompressedWorker:function(){return new n(i.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},o.createWorkerFrom=function(t,e,r){return t.pipe(new s).pipe(new a("uncompressedSize")).pipe(e.compressWorker(r)).pipe(new a("compressedSize")).withStreamInfo("compression",e)},e.exports=o;},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(t,e,r){var i=t("./stream/GenericWorker");r.STORE={magic:"\0\0",compressWorker:function(t){return new i("STORE compression")},uncompressWorker:function(){return new i("STORE decompression")}},r.DEFLATE=t("./flate");},{"./flate":7,"./stream/GenericWorker":28}],4:[function(t,e,r){var i=t("./utils");var o=function(){for(var t,e=[],r=0;r<256;r++){t=r;for(var i=0;i<8;i++)t=1&t?3988292384^t>>>1:t>>>1;e[r]=t;}return e}();e.exports=function(t,e){return void 0!==t&&t.length?"string"!==i.getTypeOf(t)?function(t,e,r,i){var n=o,s=i+r;t^=-1;for(var a=i;a<s;a++)t=t>>>8^n[255&(t^e[a])];return -1^t}(0|e,t,t.length,0):function(t,e,r,i){var n=o,s=i+r;t^=-1;for(var a=i;a<s;a++)t=t>>>8^n[255&(t^e.charCodeAt(a))];return -1^t}(0|e,t,t.length,0):0};},{"./utils":32}],5:[function(t,e,r){r.base64=!1,r.binary=!1,r.dir=!1,r.createFolders=!0,r.date=null,r.compression=null,r.compressionOptions=null,r.comment=null,r.unixPermissions=null,r.dosPermissions=null;},{}],6:[function(t,e,r){var i=null;i="undefined"!=typeof Promise?Promise:t("lie"),e.exports={Promise:i};},{lie:37}],7:[function(t,e,r){var i="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array,n=t("pako"),s=t("./utils"),a=t("./stream/GenericWorker"),o=i?"uint8array":"array";function h(t,e){a.call(this,"FlateWorker/"+t),this._pako=null,this._pakoAction=t,this._pakoOptions=e,this.meta={};}r.magic="\b\0",s.inherits(h,a),h.prototype.processChunk=function(t){this.meta=t.meta,null===this._pako&&this._createPako(),this._pako.push(s.transformTo(o,t.data),!1);},h.prototype.flush=function(){a.prototype.flush.call(this),null===this._pako&&this._createPako(),this._pako.push([],!0);},h.prototype.cleanUp=function(){a.prototype.cleanUp.call(this),this._pako=null;},h.prototype._createPako=function(){this._pako=new n[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var e=this;this._pako.onData=function(t){e.push({data:t,meta:e.meta});};},r.compressWorker=function(t){return new h("Deflate",t)},r.uncompressWorker=function(){return new h("Inflate",{})};},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(t,e,r){function A(t,e){var r,i="";for(r=0;r<e;r++)i+=String.fromCharCode(255&t),t>>>=8;return i}function i(t,e,r,i,n,s){var a,o,h=t.file,u=t.compression,l=s!==O.utf8encode,f=I.transformTo("string",s(h.name)),d=I.transformTo("string",O.utf8encode(h.name)),c=h.comment,p=I.transformTo("string",s(c)),m=I.transformTo("string",O.utf8encode(c)),_=d.length!==h.name.length,g=m.length!==c.length,b="",v="",y="",w=h.dir,k=h.date,x={crc32:0,compressedSize:0,uncompressedSize:0};e&&!r||(x.crc32=t.crc32,x.compressedSize=t.compressedSize,x.uncompressedSize=t.uncompressedSize);var S=0;e&&(S|=8),l||!_&&!g||(S|=2048);var z=0,C=0;w&&(z|=16),"UNIX"===n?(C=798,z|=function(t,e){var r=t;return t||(r=e?16893:33204),(65535&r)<<16}(h.unixPermissions,w)):(C=20,z|=function(t){return 63&(t||0)}(h.dosPermissions)),a=k.getUTCHours(),a<<=6,a|=k.getUTCMinutes(),a<<=5,a|=k.getUTCSeconds()/2,o=k.getUTCFullYear()-1980,o<<=4,o|=k.getUTCMonth()+1,o<<=5,o|=k.getUTCDate(),_&&(v=A(1,1)+A(B(f),4)+d,b+="up"+A(v.length,2)+v),g&&(y=A(1,1)+A(B(p),4)+m,b+="uc"+A(y.length,2)+y);var E="";return E+="\n\0",E+=A(S,2),E+=u.magic,E+=A(a,2),E+=A(o,2),E+=A(x.crc32,4),E+=A(x.compressedSize,4),E+=A(x.uncompressedSize,4),E+=A(f.length,2),E+=A(b.length,2),{fileRecord:R.LOCAL_FILE_HEADER+E+f+b,dirRecord:R.CENTRAL_FILE_HEADER+A(C,2)+E+A(p.length,2)+"\0\0\0\0"+A(z,4)+A(i,4)+f+b+p}}var I=t("../utils"),n=t("../stream/GenericWorker"),O=t("../utf8"),B=t("../crc32"),R=t("../signature");function s(t,e,r,i){n.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=e,this.zipPlatform=r,this.encodeFileName=i,this.streamFiles=t,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[];}I.inherits(s,n),s.prototype.push=function(t){var e=t.meta.percent||0,r=this.entriesCount,i=this._sources.length;this.accumulate?this.contentBuffer.push(t):(this.bytesWritten+=t.data.length,n.prototype.push.call(this,{data:t.data,meta:{currentFile:this.currentFile,percent:r?(e+100*(r-i-1))/r:100}}));},s.prototype.openedSource=function(t){this.currentSourceOffset=this.bytesWritten,this.currentFile=t.file.name;var e=this.streamFiles&&!t.file.dir;if(e){var r=i(t,e,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:r.fileRecord,meta:{percent:0}});}else this.accumulate=!0;},s.prototype.closedSource=function(t){this.accumulate=!1;var e=this.streamFiles&&!t.file.dir,r=i(t,e,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(r.dirRecord),e)this.push({data:function(t){return R.DATA_DESCRIPTOR+A(t.crc32,4)+A(t.compressedSize,4)+A(t.uncompressedSize,4)}(t),meta:{percent:100}});else for(this.push({data:r.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null;},s.prototype.flush=function(){for(var t=this.bytesWritten,e=0;e<this.dirRecords.length;e++)this.push({data:this.dirRecords[e],meta:{percent:100}});var r=this.bytesWritten-t,i=function(t,e,r,i,n){var s=I.transformTo("string",n(i));return R.CENTRAL_DIRECTORY_END+"\0\0\0\0"+A(t,2)+A(t,2)+A(e,4)+A(r,4)+A(s.length,2)+s}(this.dirRecords.length,r,t,this.zipComment,this.encodeFileName);this.push({data:i,meta:{percent:100}});},s.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume();},s.prototype.registerPrevious=function(t){this._sources.push(t);var e=this;return t.on("data",function(t){e.processChunk(t);}),t.on("end",function(){e.closedSource(e.previous.streamInfo),e._sources.length?e.prepareNextSource():e.end();}),t.on("error",function(t){e.error(t);}),this},s.prototype.resume=function(){return !!n.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},s.prototype.error=function(t){var e=this._sources;if(!n.prototype.error.call(this,t))return !1;for(var r=0;r<e.length;r++)try{e[r].error(t);}catch(t){}return !0},s.prototype.lock=function(){n.prototype.lock.call(this);for(var t=this._sources,e=0;e<t.length;e++)t[e].lock();},e.exports=s;},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(t,e,r){var u=t("../compressions"),i=t("./ZipFileWorker");r.generateWorker=function(t,a,e){var o=new i(a.streamFiles,e,a.platform,a.encodeFileName),h=0;try{t.forEach(function(t,e){h++;var r=function(t,e){var r=t||e,i=u[r];if(!i)throw new Error(r+" is not a valid compression method !");return i}(e.options.compression,a.compression),i=e.options.compressionOptions||a.compressionOptions||{},n=e.dir,s=e.date;e._compressWorker(r,i).withStreamInfo("file",{name:t,dir:n,date:s,comment:e.comment||"",unixPermissions:e.unixPermissions,dosPermissions:e.dosPermissions}).pipe(o);}),o.entriesCount=h;}catch(t){o.error(t);}return o};},{"../compressions":3,"./ZipFileWorker":8}],10:[function(t,e,r){function i(){if(!(this instanceof i))return new i;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files=Object.create(null),this.comment=null,this.root="",this.clone=function(){var t=new i;for(var e in this)"function"!=typeof this[e]&&(t[e]=this[e]);return t};}(i.prototype=t("./object")).loadAsync=t("./load"),i.support=t("./support"),i.defaults=t("./defaults"),i.version="3.9.1",i.loadAsync=function(t,e){return (new i).loadAsync(t,e)},i.external=t("./external"),e.exports=i;},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(t,e,r){var u=t("./utils"),n=t("./external"),i=t("./utf8"),s=t("./zipEntries"),a=t("./stream/Crc32Probe"),l=t("./nodejsUtils");function f(i){return new n.Promise(function(t,e){var r=i.decompressed.getContentWorker().pipe(new a);r.on("error",function(t){e(t);}).on("end",function(){r.streamInfo.crc32!==i.decompressed.crc32?e(new Error("Corrupted zip : CRC32 mismatch")):t();}).resume();})}e.exports=function(t,o){var h=this;return o=u.extend(o||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:i.utf8decode}),l.isNode&&l.isStream(t)?n.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):u.prepareContent("the loaded zip file",t,!0,o.optimizedBinaryString,o.base64).then(function(t){var e=new s(o);return e.load(t),e}).then(function(t){var e=[n.Promise.resolve(t)],r=t.files;if(o.checkCRC32)for(var i=0;i<r.length;i++)e.push(f(r[i]));return n.Promise.all(e)}).then(function(t){for(var e=t.shift(),r=e.files,i=0;i<r.length;i++){var n=r[i],s=n.fileNameStr,a=u.resolve(n.fileNameStr);h.file(a,n.decompressed,{binary:!0,optimizedBinaryString:!0,date:n.date,dir:n.dir,comment:n.fileCommentStr.length?n.fileCommentStr:null,unixPermissions:n.unixPermissions,dosPermissions:n.dosPermissions,createFolders:o.createFolders}),n.dir||(h.file(a).unsafeOriginalName=s);}return e.zipComment.length&&(h.comment=e.zipComment),h})};},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(t,e,r){var i=t("../utils"),n=t("../stream/GenericWorker");function s(t,e){n.call(this,"Nodejs stream input adapter for "+t),this._upstreamEnded=!1,this._bindStream(e);}i.inherits(s,n),s.prototype._bindStream=function(t){var e=this;(this._stream=t).pause(),t.on("data",function(t){e.push({data:t,meta:{percent:0}});}).on("error",function(t){e.isPaused?this.generatedError=t:e.error(t);}).on("end",function(){e.isPaused?e._upstreamEnded=!0:e.end();});},s.prototype.pause=function(){return !!n.prototype.pause.call(this)&&(this._stream.pause(),!0)},s.prototype.resume=function(){return !!n.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},e.exports=s;},{"../stream/GenericWorker":28,"../utils":32}],13:[function(t,e,r){var n=t("readable-stream").Readable;function i(t,e,r){n.call(this,e),this._helper=t;var i=this;t.on("data",function(t,e){i.push(t)||i._helper.pause(),r&&r(e);}).on("error",function(t){i.emit("error",t);}).on("end",function(){i.push(null);});}t("../utils").inherits(i,n),i.prototype._read=function(){this._helper.resume();},e.exports=i;},{"../utils":32,"readable-stream":16}],14:[function(t,e,r){e.exports={isNode:"undefined"!=typeof Buffer,newBufferFrom:function(t,e){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(t,e);if("number"==typeof t)throw new Error('The "data" argument must not be a number');return new Buffer(t,e)},allocBuffer:function(t){if(Buffer.alloc)return Buffer.alloc(t);var e=new Buffer(t);return e.fill(0),e},isBuffer:function(t){return Buffer.isBuffer(t)},isStream:function(t){return t&&"function"==typeof t.on&&"function"==typeof t.pause&&"function"==typeof t.resume}};},{}],15:[function(t,e,r){function s(t,e,r){var i,n=u.getTypeOf(e),s=u.extend(r||{},f);s.date=s.date||new Date,null!==s.compression&&(s.compression=s.compression.toUpperCase()),"string"==typeof s.unixPermissions&&(s.unixPermissions=parseInt(s.unixPermissions,8)),s.unixPermissions&&16384&s.unixPermissions&&(s.dir=!0),s.dosPermissions&&16&s.dosPermissions&&(s.dir=!0),s.dir&&(t=g(t)),s.createFolders&&(i=_(t))&&b.call(this,i,!0);var a="string"===n&&!1===s.binary&&!1===s.base64;r&&void 0!==r.binary||(s.binary=!a),(e instanceof d&&0===e.uncompressedSize||s.dir||!e||0===e.length)&&(s.base64=!1,s.binary=!0,e="",s.compression="STORE",n="string");var o=null;o=e instanceof d||e instanceof l?e:p.isNode&&p.isStream(e)?new m(t,e):u.prepareContent(t,e,s.binary,s.optimizedBinaryString,s.base64);var h=new c(t,o,s);this.files[t]=h;}var n=t("./utf8"),u=t("./utils"),l=t("./stream/GenericWorker"),a=t("./stream/StreamHelper"),f=t("./defaults"),d=t("./compressedObject"),c=t("./zipObject"),o=t("./generate"),p=t("./nodejsUtils"),m=t("./nodejs/NodejsStreamInputAdapter"),_=function(t){"/"===t.slice(-1)&&(t=t.substring(0,t.length-1));var e=t.lastIndexOf("/");return 0<e?t.substring(0,e):""},g=function(t){return "/"!==t.slice(-1)&&(t+="/"),t},b=function(t,e){return e=void 0!==e?e:f.createFolders,t=g(t),this.files[t]||s.call(this,t,null,{dir:!0,createFolders:e}),this.files[t]};function h(t){return "[object RegExp]"===Object.prototype.toString.call(t)}var i={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(t){var e,r,i;for(e in this.files)i=this.files[e],(r=e.slice(this.root.length,e.length))&&e.slice(0,this.root.length)===this.root&&t(r,i);},filter:function(r){var i=[];return this.forEach(function(t,e){r(t,e)&&i.push(e);}),i},file:function(t,e,r){if(1!==arguments.length)return t=this.root+t,s.call(this,t,e,r),this;if(h(t)){var i=t;return this.filter(function(t,e){return !e.dir&&i.test(t)})}var n=this.files[this.root+t];return n&&!n.dir?n:null},folder:function(r){if(!r)return this;if(h(r))return this.filter(function(t,e){return e.dir&&r.test(t)});var t=this.root+r,e=b.call(this,t),i=this.clone();return i.root=e.name,i},remove:function(r){r=this.root+r;var t=this.files[r];if(t||("/"!==r.slice(-1)&&(r+="/"),t=this.files[r]),t&&!t.dir)delete this.files[r];else for(var e=this.filter(function(t,e){return e.name.slice(0,r.length)===r}),i=0;i<e.length;i++)delete this.files[e[i].name];return this},generate:function(t){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(t){var e,r={};try{if((r=u.extend(t||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:n.utf8encode})).type=r.type.toLowerCase(),r.compression=r.compression.toUpperCase(),"binarystring"===r.type&&(r.type="string"),!r.type)throw new Error("No output type specified.");u.checkSupport(r.type),"darwin"!==r.platform&&"freebsd"!==r.platform&&"linux"!==r.platform&&"sunos"!==r.platform||(r.platform="UNIX"),"win32"===r.platform&&(r.platform="DOS");var i=r.comment||this.comment||"";e=o.generateWorker(this,r,i);}catch(t){(e=new l("error")).error(t);}return new a(e,r.type||"string",r.mimeType)},generateAsync:function(t,e){return this.generateInternalStream(t).accumulate(e)},generateNodeStream:function(t,e){return (t=t||{}).type||(t.type="nodebuffer"),this.generateInternalStream(t).toNodejsStream(e)}};e.exports=i;},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(t,e,r){e.exports=t("stream");},{stream:void 0}],17:[function(t,e,r){var i=t("./DataReader");function n(t){i.call(this,t);for(var e=0;e<this.data.length;e++)t[e]=255&t[e];}t("../utils").inherits(n,i),n.prototype.byteAt=function(t){return this.data[this.zero+t]},n.prototype.lastIndexOfSignature=function(t){for(var e=t.charCodeAt(0),r=t.charCodeAt(1),i=t.charCodeAt(2),n=t.charCodeAt(3),s=this.length-4;0<=s;--s)if(this.data[s]===e&&this.data[s+1]===r&&this.data[s+2]===i&&this.data[s+3]===n)return s-this.zero;return -1},n.prototype.readAndCheckSignature=function(t){var e=t.charCodeAt(0),r=t.charCodeAt(1),i=t.charCodeAt(2),n=t.charCodeAt(3),s=this.readData(4);return e===s[0]&&r===s[1]&&i===s[2]&&n===s[3]},n.prototype.readData=function(t){if(this.checkOffset(t),0===t)return [];var e=this.data.slice(this.zero+this.index,this.zero+this.index+t);return this.index+=t,e},e.exports=n;},{"../utils":32,"./DataReader":18}],18:[function(t,e,r){var i=t("../utils");function n(t){this.data=t,this.length=t.length,this.index=0,this.zero=0;}n.prototype={checkOffset:function(t){this.checkIndex(this.index+t);},checkIndex:function(t){if(this.length<this.zero+t||t<0)throw new Error("End of data reached (data length = "+this.length+", asked index = "+t+"). Corrupted zip ?")},setIndex:function(t){this.checkIndex(t),this.index=t;},skip:function(t){this.setIndex(this.index+t);},byteAt:function(t){},readInt:function(t){var e,r=0;for(this.checkOffset(t),e=this.index+t-1;e>=this.index;e--)r=(r<<8)+this.byteAt(e);return this.index+=t,r},readString:function(t){return i.transformTo("string",this.readData(t))},readData:function(t){},lastIndexOfSignature:function(t){},readAndCheckSignature:function(t){},readDate:function(){var t=this.readInt(4);return new Date(Date.UTC(1980+(t>>25&127),(t>>21&15)-1,t>>16&31,t>>11&31,t>>5&63,(31&t)<<1))}},e.exports=n;},{"../utils":32}],19:[function(t,e,r){var i=t("./Uint8ArrayReader");function n(t){i.call(this,t);}t("../utils").inherits(n,i),n.prototype.readData=function(t){this.checkOffset(t);var e=this.data.slice(this.zero+this.index,this.zero+this.index+t);return this.index+=t,e},e.exports=n;},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(t,e,r){var i=t("./DataReader");function n(t){i.call(this,t);}t("../utils").inherits(n,i),n.prototype.byteAt=function(t){return this.data.charCodeAt(this.zero+t)},n.prototype.lastIndexOfSignature=function(t){return this.data.lastIndexOf(t)-this.zero},n.prototype.readAndCheckSignature=function(t){return t===this.readData(4)},n.prototype.readData=function(t){this.checkOffset(t);var e=this.data.slice(this.zero+this.index,this.zero+this.index+t);return this.index+=t,e},e.exports=n;},{"../utils":32,"./DataReader":18}],21:[function(t,e,r){var i=t("./ArrayReader");function n(t){i.call(this,t);}t("../utils").inherits(n,i),n.prototype.readData=function(t){if(this.checkOffset(t),0===t)return new Uint8Array(0);var e=this.data.subarray(this.zero+this.index,this.zero+this.index+t);return this.index+=t,e},e.exports=n;},{"../utils":32,"./ArrayReader":17}],22:[function(t,e,r){var i=t("../utils"),n=t("../support"),s=t("./ArrayReader"),a=t("./StringReader"),o=t("./NodeBufferReader"),h=t("./Uint8ArrayReader");e.exports=function(t){var e=i.getTypeOf(t);return i.checkSupport(e),"string"!==e||n.uint8array?"nodebuffer"===e?new o(t):n.uint8array?new h(i.transformTo("uint8array",t)):new s(i.transformTo("array",t)):new a(t)};},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(t,e,r){r.LOCAL_FILE_HEADER="PK",r.CENTRAL_FILE_HEADER="PK",r.CENTRAL_DIRECTORY_END="PK",r.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK",r.ZIP64_CENTRAL_DIRECTORY_END="PK",r.DATA_DESCRIPTOR="PK\b";},{}],24:[function(t,e,r){var i=t("./GenericWorker"),n=t("../utils");function s(t){i.call(this,"ConvertWorker to "+t),this.destType=t;}n.inherits(s,i),s.prototype.processChunk=function(t){this.push({data:n.transformTo(this.destType,t.data),meta:t.meta});},e.exports=s;},{"../utils":32,"./GenericWorker":28}],25:[function(t,e,r){var i=t("./GenericWorker"),n=t("../crc32");function s(){i.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0);}t("../utils").inherits(s,i),s.prototype.processChunk=function(t){this.streamInfo.crc32=n(t.data,this.streamInfo.crc32||0),this.push(t);},e.exports=s;},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(t,e,r){var i=t("../utils"),n=t("./GenericWorker");function s(t){n.call(this,"DataLengthProbe for "+t),this.propName=t,this.withStreamInfo(t,0);}i.inherits(s,n),s.prototype.processChunk=function(t){if(t){var e=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=e+t.data.length;}n.prototype.processChunk.call(this,t);},e.exports=s;},{"../utils":32,"./GenericWorker":28}],27:[function(t,e,r){var i=t("../utils"),n=t("./GenericWorker");function s(t){n.call(this,"DataWorker");var e=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,t.then(function(t){e.dataIsReady=!0,e.data=t,e.max=t&&t.length||0,e.type=i.getTypeOf(t),e.isPaused||e._tickAndRepeat();},function(t){e.error(t);});}i.inherits(s,n),s.prototype.cleanUp=function(){n.prototype.cleanUp.call(this),this.data=null;},s.prototype.resume=function(){return !!n.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,i.delay(this._tickAndRepeat,[],this)),!0)},s.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(i.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0));},s.prototype._tick=function(){if(this.isPaused||this.isFinished)return !1;var t=null,e=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":t=this.data.substring(this.index,e);break;case"uint8array":t=this.data.subarray(this.index,e);break;case"array":case"nodebuffer":t=this.data.slice(this.index,e);}return this.index=e,this.push({data:t,meta:{percent:this.max?this.index/this.max*100:0}})},e.exports=s;},{"../utils":32,"./GenericWorker":28}],28:[function(t,e,r){function i(t){this.name=t||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null;}i.prototype={push:function(t){this.emit("data",t);},end:function(){if(this.isFinished)return !1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0;}catch(t){this.emit("error",t);}return !0},error:function(t){return !this.isFinished&&(this.isPaused?this.generatedError=t:(this.isFinished=!0,this.emit("error",t),this.previous&&this.previous.error(t),this.cleanUp()),!0)},on:function(t,e){return this._listeners[t].push(e),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[];},emit:function(t,e){if(this._listeners[t])for(var r=0;r<this._listeners[t].length;r++)this._listeners[t][r].call(this,e);},pipe:function(t){return t.registerPrevious(this)},registerPrevious:function(t){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=t.streamInfo,this.mergeStreamInfo(),this.previous=t;var e=this;return t.on("data",function(t){e.processChunk(t);}),t.on("end",function(){e.end();}),t.on("error",function(t){e.error(t);}),this},pause:function(){return !this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return !1;var t=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),t=!0),this.previous&&this.previous.resume(),!t},flush:function(){},processChunk:function(t){this.push(t);},withStreamInfo:function(t,e){return this.extraStreamInfo[t]=e,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var t in this.extraStreamInfo)this.extraStreamInfo.hasOwnProperty(t)&&(this.streamInfo[t]=this.extraStreamInfo[t]);},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock();},toString:function(){var t="Worker "+this.name;return this.previous?this.previous+" -> "+t:t}},e.exports=i;},{}],29:[function(t,e,r){var h=t("../utils"),n=t("./ConvertWorker"),s=t("./GenericWorker"),u=t("../base64"),i=t("../support"),a=t("../external"),o=null;if(i.nodestream)try{o=t("../nodejs/NodejsStreamOutputAdapter");}catch(t){}function l(t,o){return new a.Promise(function(e,r){var i=[],n=t._internalType,s=t._outputType,a=t._mimeType;t.on("data",function(t,e){i.push(t),o&&o(e);}).on("error",function(t){i=[],r(t);}).on("end",function(){try{var t=function(t,e,r){switch(t){case"blob":return h.newBlob(h.transformTo("arraybuffer",e),r);case"base64":return u.encode(e);default:return h.transformTo(t,e)}}(s,function(t,e){var r,i=0,n=null,s=0;for(r=0;r<e.length;r++)s+=e[r].length;switch(t){case"string":return e.join("");case"array":return Array.prototype.concat.apply([],e);case"uint8array":for(n=new Uint8Array(s),r=0;r<e.length;r++)n.set(e[r],i),i+=e[r].length;return n;case"nodebuffer":return Buffer.concat(e);default:throw new Error("concat : unsupported type '"+t+"'")}}(n,i),a);e(t);}catch(t){r(t);}i=[];}).resume();})}function f(t,e,r){var i=e;switch(e){case"blob":case"arraybuffer":i="uint8array";break;case"base64":i="string";}try{this._internalType=i,this._outputType=e,this._mimeType=r,h.checkSupport(i),this._worker=t.pipe(new n(i)),t.lock();}catch(t){this._worker=new s("error"),this._worker.error(t);}}f.prototype={accumulate:function(t){return l(this,t)},on:function(t,e){var r=this;return "data"===t?this._worker.on(t,function(t){e.call(r,t.data,t.meta);}):this._worker.on(t,function(){h.delay(e,arguments,r);}),this},resume:function(){return h.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(t){if(h.checkSupport("nodestream"),"nodebuffer"!==this._outputType)throw new Error(this._outputType+" is not supported by this method");return new o(this,{objectMode:"nodebuffer"!==this._outputType},t)}},e.exports=f;},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(t,e,r){if(r.base64=!0,r.array=!0,r.string=!0,r.arraybuffer="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof Uint8Array,r.nodebuffer="undefined"!=typeof Buffer,r.uint8array="undefined"!=typeof Uint8Array,"undefined"==typeof ArrayBuffer)r.blob=!1;else {var i=new ArrayBuffer(0);try{r.blob=0===new Blob([i],{type:"application/zip"}).size;}catch(t){try{var n=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);n.append(i),r.blob=0===n.getBlob("application/zip").size;}catch(t){r.blob=!1;}}}try{r.nodestream=!!t("readable-stream").Readable;}catch(t){r.nodestream=!1;}},{"readable-stream":16}],31:[function(t,e,s){for(var o=t("./utils"),h=t("./support"),r=t("./nodejsUtils"),i=t("./stream/GenericWorker"),u=new Array(256),n=0;n<256;n++)u[n]=252<=n?6:248<=n?5:240<=n?4:224<=n?3:192<=n?2:1;u[254]=u[254]=1;function a(){i.call(this,"utf-8 decode"),this.leftOver=null;}function l(){i.call(this,"utf-8 encode");}s.utf8encode=function(t){return h.nodebuffer?r.newBufferFrom(t,"utf-8"):function(t){var e,r,i,n,s,a=t.length,o=0;for(n=0;n<a;n++)55296==(64512&(r=t.charCodeAt(n)))&&n+1<a&&56320==(64512&(i=t.charCodeAt(n+1)))&&(r=65536+(r-55296<<10)+(i-56320),n++),o+=r<128?1:r<2048?2:r<65536?3:4;for(e=h.uint8array?new Uint8Array(o):new Array(o),n=s=0;s<o;n++)55296==(64512&(r=t.charCodeAt(n)))&&n+1<a&&56320==(64512&(i=t.charCodeAt(n+1)))&&(r=65536+(r-55296<<10)+(i-56320),n++),r<128?e[s++]=r:(r<2048?e[s++]=192|r>>>6:(r<65536?e[s++]=224|r>>>12:(e[s++]=240|r>>>18,e[s++]=128|r>>>12&63),e[s++]=128|r>>>6&63),e[s++]=128|63&r);return e}(t)},s.utf8decode=function(t){return h.nodebuffer?o.transformTo("nodebuffer",t).toString("utf-8"):function(t){var e,r,i,n,s=t.length,a=new Array(2*s);for(e=r=0;e<s;)if((i=t[e++])<128)a[r++]=i;else if(4<(n=u[i]))a[r++]=65533,e+=n-1;else {for(i&=2===n?31:3===n?15:7;1<n&&e<s;)i=i<<6|63&t[e++],n--;1<n?a[r++]=65533:i<65536?a[r++]=i:(i-=65536,a[r++]=55296|i>>10&1023,a[r++]=56320|1023&i);}return a.length!==r&&(a.subarray?a=a.subarray(0,r):a.length=r),o.applyFromCharCode(a)}(t=o.transformTo(h.uint8array?"uint8array":"array",t))},o.inherits(a,i),a.prototype.processChunk=function(t){var e=o.transformTo(h.uint8array?"uint8array":"array",t.data);if(this.leftOver&&this.leftOver.length){if(h.uint8array){var r=e;(e=new Uint8Array(r.length+this.leftOver.length)).set(this.leftOver,0),e.set(r,this.leftOver.length);}else e=this.leftOver.concat(e);this.leftOver=null;}var i=function(t,e){var r;for((e=e||t.length)>t.length&&(e=t.length),r=e-1;0<=r&&128==(192&t[r]);)r--;return r<0?e:0===r?e:r+u[t[r]]>e?r:e}(e),n=e;i!==e.length&&(h.uint8array?(n=e.subarray(0,i),this.leftOver=e.subarray(i,e.length)):(n=e.slice(0,i),this.leftOver=e.slice(i,e.length))),this.push({data:s.utf8decode(n),meta:t.meta});},a.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:s.utf8decode(this.leftOver),meta:{}}),this.leftOver=null);},s.Utf8DecodeWorker=a,o.inherits(l,i),l.prototype.processChunk=function(t){this.push({data:s.utf8encode(t.data),meta:t.meta});},s.Utf8EncodeWorker=l;},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(t,e,a){var o=t("./support"),h=t("./base64"),r=t("./nodejsUtils"),i=t("set-immediate-shim"),u=t("./external");function n(t){return t}function l(t,e){for(var r=0;r<t.length;++r)e[r]=255&t.charCodeAt(r);return e}a.newBlob=function(e,r){a.checkSupport("blob");try{return new Blob([e],{type:r})}catch(t){try{var i=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return i.append(e),i.getBlob(r)}catch(t){throw new Error("Bug : can't construct the Blob.")}}};var s={stringifyByChunk:function(t,e,r){var i=[],n=0,s=t.length;if(s<=r)return String.fromCharCode.apply(null,t);for(;n<s;)"array"===e||"nodebuffer"===e?i.push(String.fromCharCode.apply(null,t.slice(n,Math.min(n+r,s)))):i.push(String.fromCharCode.apply(null,t.subarray(n,Math.min(n+r,s)))),n+=r;return i.join("")},stringifyByChar:function(t){for(var e="",r=0;r<t.length;r++)e+=String.fromCharCode(t[r]);return e},applyCanBeUsed:{uint8array:function(){try{return o.uint8array&&1===String.fromCharCode.apply(null,new Uint8Array(1)).length}catch(t){return !1}}(),nodebuffer:function(){try{return o.nodebuffer&&1===String.fromCharCode.apply(null,r.allocBuffer(1)).length}catch(t){return !1}}()}};function f(t){var e=65536,r=a.getTypeOf(t),i=!0;if("uint8array"===r?i=s.applyCanBeUsed.uint8array:"nodebuffer"===r&&(i=s.applyCanBeUsed.nodebuffer),i)for(;1<e;)try{return s.stringifyByChunk(t,r,e)}catch(t){e=Math.floor(e/2);}return s.stringifyByChar(t)}function d(t,e){for(var r=0;r<t.length;r++)e[r]=t[r];return e}a.applyFromCharCode=f;var c={};c.string={string:n,array:function(t){return l(t,new Array(t.length))},arraybuffer:function(t){return c.string.uint8array(t).buffer},uint8array:function(t){return l(t,new Uint8Array(t.length))},nodebuffer:function(t){return l(t,r.allocBuffer(t.length))}},c.array={string:f,array:n,arraybuffer:function(t){return new Uint8Array(t).buffer},uint8array:function(t){return new Uint8Array(t)},nodebuffer:function(t){return r.newBufferFrom(t)}},c.arraybuffer={string:function(t){return f(new Uint8Array(t))},array:function(t){return d(new Uint8Array(t),new Array(t.byteLength))},arraybuffer:n,uint8array:function(t){return new Uint8Array(t)},nodebuffer:function(t){return r.newBufferFrom(new Uint8Array(t))}},c.uint8array={string:f,array:function(t){return d(t,new Array(t.length))},arraybuffer:function(t){return t.buffer},uint8array:n,nodebuffer:function(t){return r.newBufferFrom(t)}},c.nodebuffer={string:f,array:function(t){return d(t,new Array(t.length))},arraybuffer:function(t){return c.nodebuffer.uint8array(t).buffer},uint8array:function(t){return d(t,new Uint8Array(t.length))},nodebuffer:n},a.transformTo=function(t,e){if(e=e||"",!t)return e;a.checkSupport(t);var r=a.getTypeOf(e);return c[r][t](e)},a.resolve=function(t){for(var e=t.split("/"),r=[],i=0;i<e.length;i++){var n=e[i];"."===n||""===n&&0!==i&&i!==e.length-1||(".."===n?r.pop():r.push(n));}return r.join("/")},a.getTypeOf=function(t){return "string"==typeof t?"string":"[object Array]"===Object.prototype.toString.call(t)?"array":o.nodebuffer&&r.isBuffer(t)?"nodebuffer":o.uint8array&&t instanceof Uint8Array?"uint8array":o.arraybuffer&&t instanceof ArrayBuffer?"arraybuffer":void 0},a.checkSupport=function(t){if(!o[t.toLowerCase()])throw new Error(t+" is not supported by this platform")},a.MAX_VALUE_16BITS=65535,a.MAX_VALUE_32BITS=-1,a.pretty=function(t){var e,r,i="";for(r=0;r<(t||"").length;r++)i+="\\x"+((e=t.charCodeAt(r))<16?"0":"")+e.toString(16).toUpperCase();return i},a.delay=function(t,e,r){i(function(){t.apply(r||null,e||[]);});},a.inherits=function(t,e){function r(){}r.prototype=e.prototype,t.prototype=new r;},a.extend=function(){var t,e,r={};for(t=0;t<arguments.length;t++)for(e in arguments[t])arguments[t].hasOwnProperty(e)&&void 0===r[e]&&(r[e]=arguments[t][e]);return r},a.prepareContent=function(r,t,i,n,s){return u.Promise.resolve(t).then(function(i){return o.blob&&(i instanceof Blob||-1!==["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(i)))&&"undefined"!=typeof FileReader?new u.Promise(function(e,r){var t=new FileReader;t.onload=function(t){e(t.target.result);},t.onerror=function(t){r(t.target.error);},t.readAsArrayBuffer(i);}):i}).then(function(t){var e=a.getTypeOf(t);return e?("arraybuffer"===e?t=a.transformTo("uint8array",t):"string"===e&&(s?t=h.decode(t):i&&!0!==n&&(t=function(t){return l(t,o.uint8array?new Uint8Array(t.length):new Array(t.length))}(t))),t):u.Promise.reject(new Error("Can't read the data of '"+r+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})};},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,"set-immediate-shim":54}],33:[function(t,e,r){var i=t("./reader/readerFor"),n=t("./utils"),s=t("./signature"),a=t("./zipEntry"),o=(t("./utf8"),t("./support"));function h(t){this.files=[],this.loadOptions=t;}h.prototype={checkSignature:function(t){if(!this.reader.readAndCheckSignature(t)){this.reader.index-=4;var e=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+n.pretty(e)+", expected "+n.pretty(t)+")")}},isSignature:function(t,e){var r=this.reader.index;this.reader.setIndex(t);var i=this.reader.readString(4)===e;return this.reader.setIndex(r),i},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var t=this.reader.readData(this.zipCommentLength),e=o.uint8array?"uint8array":"array",r=n.transformTo(e,t);this.zipComment=this.loadOptions.decodeFileName(r);},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var t,e,r,i=this.zip64EndOfCentralSize-44;0<i;)t=this.reader.readInt(2),e=this.reader.readInt(4),r=this.reader.readData(e),this.zip64ExtensibleData[t]={id:t,length:e,value:r};},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var t,e;for(t=0;t<this.files.length;t++)e=this.files[t],this.reader.setIndex(e.localHeaderOffset),this.checkSignature(s.LOCAL_FILE_HEADER),e.readLocalPart(this.reader),e.handleUTF8(),e.processAttributes();},readCentralDir:function(){var t;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER);)(t=new a({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(t);if(this.centralDirRecords!==this.files.length&&0!==this.centralDirRecords&&0===this.files.length)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var t=this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);if(t<0)throw !this.isSignature(0,s.LOCAL_FILE_HEADER)?new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html"):new Error("Corrupted zip: can't find end of central directory");this.reader.setIndex(t);var e=t;if(this.checkSignature(s.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===n.MAX_VALUE_16BITS||this.diskWithCentralDirStart===n.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===n.MAX_VALUE_16BITS||this.centralDirRecords===n.MAX_VALUE_16BITS||this.centralDirSize===n.MAX_VALUE_32BITS||this.centralDirOffset===n.MAX_VALUE_32BITS){if(this.zip64=!0,(t=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(t),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,s.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral();}var r=this.centralDirOffset+this.centralDirSize;this.zip64&&(r+=20,r+=12+this.zip64EndOfCentralSize);var i=e-r;if(0<i)this.isSignature(e,s.CENTRAL_FILE_HEADER)||(this.reader.zero=i);else if(i<0)throw new Error("Corrupted zip: missing "+Math.abs(i)+" bytes.")},prepareReader:function(t){this.reader=i(t);},load:function(t){this.prepareReader(t),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles();}},e.exports=h;},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utf8":31,"./utils":32,"./zipEntry":34}],34:[function(t,e,r){var i=t("./reader/readerFor"),s=t("./utils"),n=t("./compressedObject"),a=t("./crc32"),o=t("./utf8"),h=t("./compressions"),u=t("./support");function l(t,e){this.options=t,this.loadOptions=e;}l.prototype={isEncrypted:function(){return 1==(1&this.bitFlag)},useUTF8:function(){return 2048==(2048&this.bitFlag)},readLocalPart:function(t){var e,r;if(t.skip(22),this.fileNameLength=t.readInt(2),r=t.readInt(2),this.fileName=t.readData(this.fileNameLength),t.skip(r),-1===this.compressedSize||-1===this.uncompressedSize)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if(null===(e=function(t){for(var e in h)if(h.hasOwnProperty(e)&&h[e].magic===t)return h[e];return null}(this.compressionMethod)))throw new Error("Corrupted zip : compression "+s.pretty(this.compressionMethod)+" unknown (inner file : "+s.transformTo("string",this.fileName)+")");this.decompressed=new n(this.compressedSize,this.uncompressedSize,this.crc32,e,t.readData(this.compressedSize));},readCentralPart:function(t){this.versionMadeBy=t.readInt(2),t.skip(2),this.bitFlag=t.readInt(2),this.compressionMethod=t.readString(2),this.date=t.readDate(),this.crc32=t.readInt(4),this.compressedSize=t.readInt(4),this.uncompressedSize=t.readInt(4);var e=t.readInt(2);if(this.extraFieldsLength=t.readInt(2),this.fileCommentLength=t.readInt(2),this.diskNumberStart=t.readInt(2),this.internalFileAttributes=t.readInt(2),this.externalFileAttributes=t.readInt(4),this.localHeaderOffset=t.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");t.skip(e),this.readExtraFields(t),this.parseZIP64ExtraField(t),this.fileComment=t.readData(this.fileCommentLength);},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var t=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),0==t&&(this.dosPermissions=63&this.externalFileAttributes),3==t&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||"/"!==this.fileNameStr.slice(-1)||(this.dir=!0);},parseZIP64ExtraField:function(t){if(this.extraFields[1]){var e=i(this.extraFields[1].value);this.uncompressedSize===s.MAX_VALUE_32BITS&&(this.uncompressedSize=e.readInt(8)),this.compressedSize===s.MAX_VALUE_32BITS&&(this.compressedSize=e.readInt(8)),this.localHeaderOffset===s.MAX_VALUE_32BITS&&(this.localHeaderOffset=e.readInt(8)),this.diskNumberStart===s.MAX_VALUE_32BITS&&(this.diskNumberStart=e.readInt(4));}},readExtraFields:function(t){var e,r,i,n=t.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});t.index+4<n;)e=t.readInt(2),r=t.readInt(2),i=t.readData(r),this.extraFields[e]={id:e,length:r,value:i};t.setIndex(n);},handleUTF8:function(){var t=u.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=o.utf8decode(this.fileName),this.fileCommentStr=o.utf8decode(this.fileComment);else {var e=this.findExtraFieldUnicodePath();if(null!==e)this.fileNameStr=e;else {var r=s.transformTo(t,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(r);}var i=this.findExtraFieldUnicodeComment();if(null!==i)this.fileCommentStr=i;else {var n=s.transformTo(t,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(n);}}},findExtraFieldUnicodePath:function(){var t=this.extraFields[28789];if(t){var e=i(t.value);return 1!==e.readInt(1)?null:a(this.fileName)!==e.readInt(4)?null:o.utf8decode(e.readData(t.length-5))}return null},findExtraFieldUnicodeComment:function(){var t=this.extraFields[25461];if(t){var e=i(t.value);return 1!==e.readInt(1)?null:a(this.fileComment)!==e.readInt(4)?null:o.utf8decode(e.readData(t.length-5))}return null}},e.exports=l;},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(t,e,r){function i(t,e,r){this.name=t,this.dir=r.dir,this.date=r.date,this.comment=r.comment,this.unixPermissions=r.unixPermissions,this.dosPermissions=r.dosPermissions,this._data=e,this._dataBinary=r.binary,this.options={compression:r.compression,compressionOptions:r.compressionOptions};}var s=t("./stream/StreamHelper"),n=t("./stream/DataWorker"),a=t("./utf8"),o=t("./compressedObject"),h=t("./stream/GenericWorker");i.prototype={internalStream:function(t){var e=null,r="string";try{if(!t)throw new Error("No output type specified.");var i="string"===(r=t.toLowerCase())||"text"===r;"binarystring"!==r&&"text"!==r||(r="string"),e=this._decompressWorker();var n=!this._dataBinary;n&&!i&&(e=e.pipe(new a.Utf8EncodeWorker)),!n&&i&&(e=e.pipe(new a.Utf8DecodeWorker));}catch(t){(e=new h("error")).error(t);}return new s(e,r,"")},async:function(t,e){return this.internalStream(t).accumulate(e)},nodeStream:function(t,e){return this.internalStream(t||"nodebuffer").toNodejsStream(e)},_compressWorker:function(t,e){if(this._data instanceof o&&this._data.compression.magic===t.magic)return this._data.getCompressedWorker();var r=this._decompressWorker();return this._dataBinary||(r=r.pipe(new a.Utf8EncodeWorker)),o.createWorkerFrom(r,t,e)},_decompressWorker:function(){return this._data instanceof o?this._data.getContentWorker():this._data instanceof h?this._data:new n(this._data)}};for(var u=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],l=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},f=0;f<u.length;f++)i.prototype[u[f]]=l;e.exports=i;},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(t,l,e){(function(e){var r,i,t=e.MutationObserver||e.WebKitMutationObserver;if(t){var n=0,s=new t(u),a=e.document.createTextNode("");s.observe(a,{characterData:!0}),r=function(){a.data=n=++n%2;};}else if(e.setImmediate||void 0===e.MessageChannel)r="document"in e&&"onreadystatechange"in e.document.createElement("script")?function(){var t=e.document.createElement("script");t.onreadystatechange=function(){u(),t.onreadystatechange=null,t.parentNode.removeChild(t),t=null;},e.document.documentElement.appendChild(t);}:function(){setTimeout(u,0);};else {var o=new e.MessageChannel;o.port1.onmessage=u,r=function(){o.port2.postMessage(0);};}var h=[];function u(){var t,e;i=!0;for(var r=h.length;r;){for(e=h,h=[],t=-1;++t<r;)e[t]();r=h.length;}i=!1;}l.exports=function(t){1!==h.push(t)||i||r();};}).call(this,"undefined"!=typeof commonjsGlobal?commonjsGlobal:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});},{}],37:[function(t,e,r){var n=t("immediate");function u(){}var l={},s=["REJECTED"],a=["FULFILLED"],i=["PENDING"];function o(t){if("function"!=typeof t)throw new TypeError("resolver must be a function");this.state=i,this.queue=[],this.outcome=void 0,t!==u&&c(this,t);}function h(t,e,r){this.promise=t,"function"==typeof e&&(this.onFulfilled=e,this.callFulfilled=this.otherCallFulfilled),"function"==typeof r&&(this.onRejected=r,this.callRejected=this.otherCallRejected);}function f(e,r,i){n(function(){var t;try{t=r(i);}catch(t){return l.reject(e,t)}t===e?l.reject(e,new TypeError("Cannot resolve promise with itself")):l.resolve(e,t);});}function d(t){var e=t&&t.then;if(t&&("object"==typeof t||"function"==typeof t)&&"function"==typeof e)return function(){e.apply(t,arguments);}}function c(e,t){var r=!1;function i(t){r||(r=!0,l.reject(e,t));}function n(t){r||(r=!0,l.resolve(e,t));}var s=p(function(){t(n,i);});"error"===s.status&&i(s.value);}function p(t,e){var r={};try{r.value=t(e),r.status="success";}catch(t){r.status="error",r.value=t;}return r}(e.exports=o).prototype.finally=function(e){if("function"!=typeof e)return this;var r=this.constructor;return this.then(function(t){return r.resolve(e()).then(function(){return t})},function(t){return r.resolve(e()).then(function(){throw t})})},o.prototype.catch=function(t){return this.then(null,t)},o.prototype.then=function(t,e){if("function"!=typeof t&&this.state===a||"function"!=typeof e&&this.state===s)return this;var r=new this.constructor(u);this.state!==i?f(r,this.state===a?t:e,this.outcome):this.queue.push(new h(r,t,e));return r},h.prototype.callFulfilled=function(t){l.resolve(this.promise,t);},h.prototype.otherCallFulfilled=function(t){f(this.promise,this.onFulfilled,t);},h.prototype.callRejected=function(t){l.reject(this.promise,t);},h.prototype.otherCallRejected=function(t){f(this.promise,this.onRejected,t);},l.resolve=function(t,e){var r=p(d,e);if("error"===r.status)return l.reject(t,r.value);var i=r.value;if(i)c(t,i);else {t.state=a,t.outcome=e;for(var n=-1,s=t.queue.length;++n<s;)t.queue[n].callFulfilled(e);}return t},l.reject=function(t,e){t.state=s,t.outcome=e;for(var r=-1,i=t.queue.length;++r<i;)t.queue[r].callRejected(e);return t},o.resolve=function(t){if(t instanceof this)return t;return l.resolve(new this(u),t)},o.reject=function(t){var e=new this(u);return l.reject(e,t)},o.all=function(t){var r=this;if("[object Array]"!==Object.prototype.toString.call(t))return this.reject(new TypeError("must be an array"));var i=t.length,n=!1;if(!i)return this.resolve([]);var s=new Array(i),a=0,e=-1,o=new this(u);for(;++e<i;)h(t[e],e);return o;function h(t,e){r.resolve(t).then(function(t){s[e]=t,++a!==i||n||(n=!0,l.resolve(o,s));},function(t){n||(n=!0,l.reject(o,t));});}},o.race=function(t){var e=this;if("[object Array]"!==Object.prototype.toString.call(t))return this.reject(new TypeError("must be an array"));var r=t.length,i=!1;if(!r)return this.resolve([]);var n=-1,s=new this(u);for(;++n<r;)a=t[n],e.resolve(a).then(function(t){i||(i=!0,l.resolve(s,t));},function(t){i||(i=!0,l.reject(s,t));});var a;return s};},{immediate:36}],38:[function(t,e,r){var i={};(0, t("./lib/utils/common").assign)(i,t("./lib/deflate"),t("./lib/inflate"),t("./lib/zlib/constants")),e.exports=i;},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(t,e,r){var a=t("./zlib/deflate"),o=t("./utils/common"),h=t("./utils/strings"),n=t("./zlib/messages"),s=t("./zlib/zstream"),u=Object.prototype.toString,l=0,f=-1,d=0,c=8;function p(t){if(!(this instanceof p))return new p(t);this.options=o.assign({level:f,method:c,chunkSize:16384,windowBits:15,memLevel:8,strategy:d,to:""},t||{});var e=this.options;e.raw&&0<e.windowBits?e.windowBits=-e.windowBits:e.gzip&&0<e.windowBits&&e.windowBits<16&&(e.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new s,this.strm.avail_out=0;var r=a.deflateInit2(this.strm,e.level,e.method,e.windowBits,e.memLevel,e.strategy);if(r!==l)throw new Error(n[r]);if(e.header&&a.deflateSetHeader(this.strm,e.header),e.dictionary){var i;if(i="string"==typeof e.dictionary?h.string2buf(e.dictionary):"[object ArrayBuffer]"===u.call(e.dictionary)?new Uint8Array(e.dictionary):e.dictionary,(r=a.deflateSetDictionary(this.strm,i))!==l)throw new Error(n[r]);this._dict_set=!0;}}function i(t,e){var r=new p(e);if(r.push(t,!0),r.err)throw r.msg||n[r.err];return r.result}p.prototype.push=function(t,e){var r,i,n=this.strm,s=this.options.chunkSize;if(this.ended)return !1;i=e===~~e?e:!0===e?4:0,"string"==typeof t?n.input=h.string2buf(t):"[object ArrayBuffer]"===u.call(t)?n.input=new Uint8Array(t):n.input=t,n.next_in=0,n.avail_in=n.input.length;do{if(0===n.avail_out&&(n.output=new o.Buf8(s),n.next_out=0,n.avail_out=s),1!==(r=a.deflate(n,i))&&r!==l)return this.onEnd(r),!(this.ended=!0);0!==n.avail_out&&(0!==n.avail_in||4!==i&&2!==i)||("string"===this.options.to?this.onData(h.buf2binstring(o.shrinkBuf(n.output,n.next_out))):this.onData(o.shrinkBuf(n.output,n.next_out)));}while((0<n.avail_in||0===n.avail_out)&&1!==r);return 4===i?(r=a.deflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===l):2!==i||(this.onEnd(l),!(n.avail_out=0))},p.prototype.onData=function(t){this.chunks.push(t);},p.prototype.onEnd=function(t){t===l&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=o.flattenChunks(this.chunks)),this.chunks=[],this.err=t,this.msg=this.strm.msg;},r.Deflate=p,r.deflate=i,r.deflateRaw=function(t,e){return (e=e||{}).raw=!0,i(t,e)},r.gzip=function(t,e){return (e=e||{}).gzip=!0,i(t,e)};},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(t,e,r){var d=t("./zlib/inflate"),c=t("./utils/common"),p=t("./utils/strings"),m=t("./zlib/constants"),i=t("./zlib/messages"),n=t("./zlib/zstream"),s=t("./zlib/gzheader"),_=Object.prototype.toString;function a(t){if(!(this instanceof a))return new a(t);this.options=c.assign({chunkSize:16384,windowBits:0,to:""},t||{});var e=this.options;e.raw&&0<=e.windowBits&&e.windowBits<16&&(e.windowBits=-e.windowBits,0===e.windowBits&&(e.windowBits=-15)),!(0<=e.windowBits&&e.windowBits<16)||t&&t.windowBits||(e.windowBits+=32),15<e.windowBits&&e.windowBits<48&&0==(15&e.windowBits)&&(e.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new n,this.strm.avail_out=0;var r=d.inflateInit2(this.strm,e.windowBits);if(r!==m.Z_OK)throw new Error(i[r]);this.header=new s,d.inflateGetHeader(this.strm,this.header);}function o(t,e){var r=new a(e);if(r.push(t,!0),r.err)throw r.msg||i[r.err];return r.result}a.prototype.push=function(t,e){var r,i,n,s,a,o,h=this.strm,u=this.options.chunkSize,l=this.options.dictionary,f=!1;if(this.ended)return !1;i=e===~~e?e:!0===e?m.Z_FINISH:m.Z_NO_FLUSH,"string"==typeof t?h.input=p.binstring2buf(t):"[object ArrayBuffer]"===_.call(t)?h.input=new Uint8Array(t):h.input=t,h.next_in=0,h.avail_in=h.input.length;do{if(0===h.avail_out&&(h.output=new c.Buf8(u),h.next_out=0,h.avail_out=u),(r=d.inflate(h,m.Z_NO_FLUSH))===m.Z_NEED_DICT&&l&&(o="string"==typeof l?p.string2buf(l):"[object ArrayBuffer]"===_.call(l)?new Uint8Array(l):l,r=d.inflateSetDictionary(this.strm,o)),r===m.Z_BUF_ERROR&&!0===f&&(r=m.Z_OK,f=!1),r!==m.Z_STREAM_END&&r!==m.Z_OK)return this.onEnd(r),!(this.ended=!0);h.next_out&&(0!==h.avail_out&&r!==m.Z_STREAM_END&&(0!==h.avail_in||i!==m.Z_FINISH&&i!==m.Z_SYNC_FLUSH)||("string"===this.options.to?(n=p.utf8border(h.output,h.next_out),s=h.next_out-n,a=p.buf2string(h.output,n),h.next_out=s,h.avail_out=u-s,s&&c.arraySet(h.output,h.output,n,s,0),this.onData(a)):this.onData(c.shrinkBuf(h.output,h.next_out)))),0===h.avail_in&&0===h.avail_out&&(f=!0);}while((0<h.avail_in||0===h.avail_out)&&r!==m.Z_STREAM_END);return r===m.Z_STREAM_END&&(i=m.Z_FINISH),i===m.Z_FINISH?(r=d.inflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===m.Z_OK):i!==m.Z_SYNC_FLUSH||(this.onEnd(m.Z_OK),!(h.avail_out=0))},a.prototype.onData=function(t){this.chunks.push(t);},a.prototype.onEnd=function(t){t===m.Z_OK&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=c.flattenChunks(this.chunks)),this.chunks=[],this.err=t,this.msg=this.strm.msg;},r.Inflate=a,r.inflate=o,r.inflateRaw=function(t,e){return (e=e||{}).raw=!0,o(t,e)},r.ungzip=o;},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(t,e,r){var i="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;r.assign=function(t){for(var e=Array.prototype.slice.call(arguments,1);e.length;){var r=e.shift();if(r){if("object"!=typeof r)throw new TypeError(r+"must be non-object");for(var i in r)r.hasOwnProperty(i)&&(t[i]=r[i]);}}return t},r.shrinkBuf=function(t,e){return t.length===e?t:t.subarray?t.subarray(0,e):(t.length=e,t)};var n={arraySet:function(t,e,r,i,n){if(e.subarray&&t.subarray)t.set(e.subarray(r,r+i),n);else for(var s=0;s<i;s++)t[n+s]=e[r+s];},flattenChunks:function(t){var e,r,i,n,s,a;for(e=i=0,r=t.length;e<r;e++)i+=t[e].length;for(a=new Uint8Array(i),e=n=0,r=t.length;e<r;e++)s=t[e],a.set(s,n),n+=s.length;return a}},s={arraySet:function(t,e,r,i,n){for(var s=0;s<i;s++)t[n+s]=e[r+s];},flattenChunks:function(t){return [].concat.apply([],t)}};r.setTyped=function(t){t?(r.Buf8=Uint8Array,r.Buf16=Uint16Array,r.Buf32=Int32Array,r.assign(r,n)):(r.Buf8=Array,r.Buf16=Array,r.Buf32=Array,r.assign(r,s));},r.setTyped(i);},{}],42:[function(t,e,r){var h=t("./common"),n=!0,s=!0;try{String.fromCharCode.apply(null,[0]);}catch(t){n=!1;}try{String.fromCharCode.apply(null,new Uint8Array(1));}catch(t){s=!1;}for(var u=new h.Buf8(256),i=0;i<256;i++)u[i]=252<=i?6:248<=i?5:240<=i?4:224<=i?3:192<=i?2:1;function l(t,e){if(e<65537&&(t.subarray&&s||!t.subarray&&n))return String.fromCharCode.apply(null,h.shrinkBuf(t,e));for(var r="",i=0;i<e;i++)r+=String.fromCharCode(t[i]);return r}u[254]=u[254]=1,r.string2buf=function(t){var e,r,i,n,s,a=t.length,o=0;for(n=0;n<a;n++)55296==(64512&(r=t.charCodeAt(n)))&&n+1<a&&56320==(64512&(i=t.charCodeAt(n+1)))&&(r=65536+(r-55296<<10)+(i-56320),n++),o+=r<128?1:r<2048?2:r<65536?3:4;for(e=new h.Buf8(o),n=s=0;s<o;n++)55296==(64512&(r=t.charCodeAt(n)))&&n+1<a&&56320==(64512&(i=t.charCodeAt(n+1)))&&(r=65536+(r-55296<<10)+(i-56320),n++),r<128?e[s++]=r:(r<2048?e[s++]=192|r>>>6:(r<65536?e[s++]=224|r>>>12:(e[s++]=240|r>>>18,e[s++]=128|r>>>12&63),e[s++]=128|r>>>6&63),e[s++]=128|63&r);return e},r.buf2binstring=function(t){return l(t,t.length)},r.binstring2buf=function(t){for(var e=new h.Buf8(t.length),r=0,i=e.length;r<i;r++)e[r]=t.charCodeAt(r);return e},r.buf2string=function(t,e){var r,i,n,s,a=e||t.length,o=new Array(2*a);for(r=i=0;r<a;)if((n=t[r++])<128)o[i++]=n;else if(4<(s=u[n]))o[i++]=65533,r+=s-1;else {for(n&=2===s?31:3===s?15:7;1<s&&r<a;)n=n<<6|63&t[r++],s--;1<s?o[i++]=65533:n<65536?o[i++]=n:(n-=65536,o[i++]=55296|n>>10&1023,o[i++]=56320|1023&n);}return l(o,i)},r.utf8border=function(t,e){var r;for((e=e||t.length)>t.length&&(e=t.length),r=e-1;0<=r&&128==(192&t[r]);)r--;return r<0?e:0===r?e:r+u[t[r]]>e?r:e};},{"./common":41}],43:[function(t,e,r){e.exports=function(t,e,r,i){for(var n=65535&t|0,s=t>>>16&65535|0,a=0;0!==r;){for(r-=a=2e3<r?2e3:r;s=s+(n=n+e[i++]|0)|0,--a;);n%=65521,s%=65521;}return n|s<<16|0};},{}],44:[function(t,e,r){e.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8};},{}],45:[function(t,e,r){var o=function(){for(var t,e=[],r=0;r<256;r++){t=r;for(var i=0;i<8;i++)t=1&t?3988292384^t>>>1:t>>>1;e[r]=t;}return e}();e.exports=function(t,e,r,i){var n=o,s=i+r;t^=-1;for(var a=i;a<s;a++)t=t>>>8^n[255&(t^e[a])];return -1^t};},{}],46:[function(t,e,r){var h,d=t("../utils/common"),u=t("./trees"),c=t("./adler32"),p=t("./crc32"),i=t("./messages"),l=0,f=4,m=0,_=-2,g=-1,b=4,n=2,v=8,y=9,s=286,a=30,o=19,w=2*s+1,k=15,x=3,S=258,z=S+x+1,C=42,E=113,A=1,I=2,O=3,B=4;function R(t,e){return t.msg=i[e],e}function T(t){return (t<<1)-(4<t?9:0)}function D(t){for(var e=t.length;0<=--e;)t[e]=0;}function F(t){var e=t.state,r=e.pending;r>t.avail_out&&(r=t.avail_out),0!==r&&(d.arraySet(t.output,e.pending_buf,e.pending_out,r,t.next_out),t.next_out+=r,e.pending_out+=r,t.total_out+=r,t.avail_out-=r,e.pending-=r,0===e.pending&&(e.pending_out=0));}function N(t,e){u._tr_flush_block(t,0<=t.block_start?t.block_start:-1,t.strstart-t.block_start,e),t.block_start=t.strstart,F(t.strm);}function U(t,e){t.pending_buf[t.pending++]=e;}function P(t,e){t.pending_buf[t.pending++]=e>>>8&255,t.pending_buf[t.pending++]=255&e;}function L(t,e){var r,i,n=t.max_chain_length,s=t.strstart,a=t.prev_length,o=t.nice_match,h=t.strstart>t.w_size-z?t.strstart-(t.w_size-z):0,u=t.window,l=t.w_mask,f=t.prev,d=t.strstart+S,c=u[s+a-1],p=u[s+a];t.prev_length>=t.good_match&&(n>>=2),o>t.lookahead&&(o=t.lookahead);do{if(u[(r=e)+a]===p&&u[r+a-1]===c&&u[r]===u[s]&&u[++r]===u[s+1]){s+=2,r++;do{}while(u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&s<d);if(i=S-(d-s),s=d-S,a<i){if(t.match_start=e,o<=(a=i))break;c=u[s+a-1],p=u[s+a];}}}while((e=f[e&l])>h&&0!=--n);return a<=t.lookahead?a:t.lookahead}function j(t){var e,r,i,n,s,a,o,h,u,l,f=t.w_size;do{if(n=t.window_size-t.lookahead-t.strstart,t.strstart>=f+(f-z)){for(d.arraySet(t.window,t.window,f,f,0),t.match_start-=f,t.strstart-=f,t.block_start-=f,e=r=t.hash_size;i=t.head[--e],t.head[e]=f<=i?i-f:0,--r;);for(e=r=f;i=t.prev[--e],t.prev[e]=f<=i?i-f:0,--r;);n+=f;}if(0===t.strm.avail_in)break;if(a=t.strm,o=t.window,h=t.strstart+t.lookahead,u=n,l=void 0,l=a.avail_in,u<l&&(l=u),r=0===l?0:(a.avail_in-=l,d.arraySet(o,a.input,a.next_in,l,h),1===a.state.wrap?a.adler=c(a.adler,o,l,h):2===a.state.wrap&&(a.adler=p(a.adler,o,l,h)),a.next_in+=l,a.total_in+=l,l),t.lookahead+=r,t.lookahead+t.insert>=x)for(s=t.strstart-t.insert,t.ins_h=t.window[s],t.ins_h=(t.ins_h<<t.hash_shift^t.window[s+1])&t.hash_mask;t.insert&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[s+x-1])&t.hash_mask,t.prev[s&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=s,s++,t.insert--,!(t.lookahead+t.insert<x)););}while(t.lookahead<z&&0!==t.strm.avail_in)}function Z(t,e){for(var r,i;;){if(t.lookahead<z){if(j(t),t.lookahead<z&&e===l)return A;if(0===t.lookahead)break}if(r=0,t.lookahead>=x&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+x-1])&t.hash_mask,r=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),0!==r&&t.strstart-r<=t.w_size-z&&(t.match_length=L(t,r)),t.match_length>=x)if(i=u._tr_tally(t,t.strstart-t.match_start,t.match_length-x),t.lookahead-=t.match_length,t.match_length<=t.max_lazy_match&&t.lookahead>=x){for(t.match_length--;t.strstart++,t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+x-1])&t.hash_mask,r=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart,0!=--t.match_length;);t.strstart++;}else t.strstart+=t.match_length,t.match_length=0,t.ins_h=t.window[t.strstart],t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+1])&t.hash_mask;else i=u._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++;if(i&&(N(t,!1),0===t.strm.avail_out))return A}return t.insert=t.strstart<x-1?t.strstart:x-1,e===f?(N(t,!0),0===t.strm.avail_out?O:B):t.last_lit&&(N(t,!1),0===t.strm.avail_out)?A:I}function W(t,e){for(var r,i,n;;){if(t.lookahead<z){if(j(t),t.lookahead<z&&e===l)return A;if(0===t.lookahead)break}if(r=0,t.lookahead>=x&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+x-1])&t.hash_mask,r=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),t.prev_length=t.match_length,t.prev_match=t.match_start,t.match_length=x-1,0!==r&&t.prev_length<t.max_lazy_match&&t.strstart-r<=t.w_size-z&&(t.match_length=L(t,r),t.match_length<=5&&(1===t.strategy||t.match_length===x&&4096<t.strstart-t.match_start)&&(t.match_length=x-1)),t.prev_length>=x&&t.match_length<=t.prev_length){for(n=t.strstart+t.lookahead-x,i=u._tr_tally(t,t.strstart-1-t.prev_match,t.prev_length-x),t.lookahead-=t.prev_length-1,t.prev_length-=2;++t.strstart<=n&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+x-1])&t.hash_mask,r=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),0!=--t.prev_length;);if(t.match_available=0,t.match_length=x-1,t.strstart++,i&&(N(t,!1),0===t.strm.avail_out))return A}else if(t.match_available){if((i=u._tr_tally(t,0,t.window[t.strstart-1]))&&N(t,!1),t.strstart++,t.lookahead--,0===t.strm.avail_out)return A}else t.match_available=1,t.strstart++,t.lookahead--;}return t.match_available&&(i=u._tr_tally(t,0,t.window[t.strstart-1]),t.match_available=0),t.insert=t.strstart<x-1?t.strstart:x-1,e===f?(N(t,!0),0===t.strm.avail_out?O:B):t.last_lit&&(N(t,!1),0===t.strm.avail_out)?A:I}function M(t,e,r,i,n){this.good_length=t,this.max_lazy=e,this.nice_length=r,this.max_chain=i,this.func=n;}function H(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=v,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new d.Buf16(2*w),this.dyn_dtree=new d.Buf16(2*(2*a+1)),this.bl_tree=new d.Buf16(2*(2*o+1)),D(this.dyn_ltree),D(this.dyn_dtree),D(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new d.Buf16(k+1),this.heap=new d.Buf16(2*s+1),D(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new d.Buf16(2*s+1),D(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0;}function G(t){var e;return t&&t.state?(t.total_in=t.total_out=0,t.data_type=n,(e=t.state).pending=0,e.pending_out=0,e.wrap<0&&(e.wrap=-e.wrap),e.status=e.wrap?C:E,t.adler=2===e.wrap?0:1,e.last_flush=l,u._tr_init(e),m):R(t,_)}function K(t){var e=G(t);return e===m&&function(t){t.window_size=2*t.w_size,D(t.head),t.max_lazy_match=h[t.level].max_lazy,t.good_match=h[t.level].good_length,t.nice_match=h[t.level].nice_length,t.max_chain_length=h[t.level].max_chain,t.strstart=0,t.block_start=0,t.lookahead=0,t.insert=0,t.match_length=t.prev_length=x-1,t.match_available=0,t.ins_h=0;}(t.state),e}function Y(t,e,r,i,n,s){if(!t)return _;var a=1;if(e===g&&(e=6),i<0?(a=0,i=-i):15<i&&(a=2,i-=16),n<1||y<n||r!==v||i<8||15<i||e<0||9<e||s<0||b<s)return R(t,_);8===i&&(i=9);var o=new H;return (t.state=o).strm=t,o.wrap=a,o.gzhead=null,o.w_bits=i,o.w_size=1<<o.w_bits,o.w_mask=o.w_size-1,o.hash_bits=n+7,o.hash_size=1<<o.hash_bits,o.hash_mask=o.hash_size-1,o.hash_shift=~~((o.hash_bits+x-1)/x),o.window=new d.Buf8(2*o.w_size),o.head=new d.Buf16(o.hash_size),o.prev=new d.Buf16(o.w_size),o.lit_bufsize=1<<n+6,o.pending_buf_size=4*o.lit_bufsize,o.pending_buf=new d.Buf8(o.pending_buf_size),o.d_buf=1*o.lit_bufsize,o.l_buf=3*o.lit_bufsize,o.level=e,o.strategy=s,o.method=r,K(t)}h=[new M(0,0,0,0,function(t,e){var r=65535;for(r>t.pending_buf_size-5&&(r=t.pending_buf_size-5);;){if(t.lookahead<=1){if(j(t),0===t.lookahead&&e===l)return A;if(0===t.lookahead)break}t.strstart+=t.lookahead,t.lookahead=0;var i=t.block_start+r;if((0===t.strstart||t.strstart>=i)&&(t.lookahead=t.strstart-i,t.strstart=i,N(t,!1),0===t.strm.avail_out))return A;if(t.strstart-t.block_start>=t.w_size-z&&(N(t,!1),0===t.strm.avail_out))return A}return t.insert=0,e===f?(N(t,!0),0===t.strm.avail_out?O:B):(t.strstart>t.block_start&&(N(t,!1),t.strm.avail_out),A)}),new M(4,4,8,4,Z),new M(4,5,16,8,Z),new M(4,6,32,32,Z),new M(4,4,16,16,W),new M(8,16,32,32,W),new M(8,16,128,128,W),new M(8,32,128,256,W),new M(32,128,258,1024,W),new M(32,258,258,4096,W)],r.deflateInit=function(t,e){return Y(t,e,v,15,8,0)},r.deflateInit2=Y,r.deflateReset=K,r.deflateResetKeep=G,r.deflateSetHeader=function(t,e){return t&&t.state?2!==t.state.wrap?_:(t.state.gzhead=e,m):_},r.deflate=function(t,e){var r,i,n,s;if(!t||!t.state||5<e||e<0)return t?R(t,_):_;if(i=t.state,!t.output||!t.input&&0!==t.avail_in||666===i.status&&e!==f)return R(t,0===t.avail_out?-5:_);if(i.strm=t,r=i.last_flush,i.last_flush=e,i.status===C)if(2===i.wrap)t.adler=0,U(i,31),U(i,139),U(i,8),i.gzhead?(U(i,(i.gzhead.text?1:0)+(i.gzhead.hcrc?2:0)+(i.gzhead.extra?4:0)+(i.gzhead.name?8:0)+(i.gzhead.comment?16:0)),U(i,255&i.gzhead.time),U(i,i.gzhead.time>>8&255),U(i,i.gzhead.time>>16&255),U(i,i.gzhead.time>>24&255),U(i,9===i.level?2:2<=i.strategy||i.level<2?4:0),U(i,255&i.gzhead.os),i.gzhead.extra&&i.gzhead.extra.length&&(U(i,255&i.gzhead.extra.length),U(i,i.gzhead.extra.length>>8&255)),i.gzhead.hcrc&&(t.adler=p(t.adler,i.pending_buf,i.pending,0)),i.gzindex=0,i.status=69):(U(i,0),U(i,0),U(i,0),U(i,0),U(i,0),U(i,9===i.level?2:2<=i.strategy||i.level<2?4:0),U(i,3),i.status=E);else {var a=v+(i.w_bits-8<<4)<<8;a|=(2<=i.strategy||i.level<2?0:i.level<6?1:6===i.level?2:3)<<6,0!==i.strstart&&(a|=32),a+=31-a%31,i.status=E,P(i,a),0!==i.strstart&&(P(i,t.adler>>>16),P(i,65535&t.adler)),t.adler=1;}if(69===i.status)if(i.gzhead.extra){for(n=i.pending;i.gzindex<(65535&i.gzhead.extra.length)&&(i.pending!==i.pending_buf_size||(i.gzhead.hcrc&&i.pending>n&&(t.adler=p(t.adler,i.pending_buf,i.pending-n,n)),F(t),n=i.pending,i.pending!==i.pending_buf_size));)U(i,255&i.gzhead.extra[i.gzindex]),i.gzindex++;i.gzhead.hcrc&&i.pending>n&&(t.adler=p(t.adler,i.pending_buf,i.pending-n,n)),i.gzindex===i.gzhead.extra.length&&(i.gzindex=0,i.status=73);}else i.status=73;if(73===i.status)if(i.gzhead.name){n=i.pending;do{if(i.pending===i.pending_buf_size&&(i.gzhead.hcrc&&i.pending>n&&(t.adler=p(t.adler,i.pending_buf,i.pending-n,n)),F(t),n=i.pending,i.pending===i.pending_buf_size)){s=1;break}s=i.gzindex<i.gzhead.name.length?255&i.gzhead.name.charCodeAt(i.gzindex++):0,U(i,s);}while(0!==s);i.gzhead.hcrc&&i.pending>n&&(t.adler=p(t.adler,i.pending_buf,i.pending-n,n)),0===s&&(i.gzindex=0,i.status=91);}else i.status=91;if(91===i.status)if(i.gzhead.comment){n=i.pending;do{if(i.pending===i.pending_buf_size&&(i.gzhead.hcrc&&i.pending>n&&(t.adler=p(t.adler,i.pending_buf,i.pending-n,n)),F(t),n=i.pending,i.pending===i.pending_buf_size)){s=1;break}s=i.gzindex<i.gzhead.comment.length?255&i.gzhead.comment.charCodeAt(i.gzindex++):0,U(i,s);}while(0!==s);i.gzhead.hcrc&&i.pending>n&&(t.adler=p(t.adler,i.pending_buf,i.pending-n,n)),0===s&&(i.status=103);}else i.status=103;if(103===i.status&&(i.gzhead.hcrc?(i.pending+2>i.pending_buf_size&&F(t),i.pending+2<=i.pending_buf_size&&(U(i,255&t.adler),U(i,t.adler>>8&255),t.adler=0,i.status=E)):i.status=E),0!==i.pending){if(F(t),0===t.avail_out)return i.last_flush=-1,m}else if(0===t.avail_in&&T(e)<=T(r)&&e!==f)return R(t,-5);if(666===i.status&&0!==t.avail_in)return R(t,-5);if(0!==t.avail_in||0!==i.lookahead||e!==l&&666!==i.status){var o=2===i.strategy?function(t,e){for(var r;;){if(0===t.lookahead&&(j(t),0===t.lookahead)){if(e===l)return A;break}if(t.match_length=0,r=u._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++,r&&(N(t,!1),0===t.strm.avail_out))return A}return t.insert=0,e===f?(N(t,!0),0===t.strm.avail_out?O:B):t.last_lit&&(N(t,!1),0===t.strm.avail_out)?A:I}(i,e):3===i.strategy?function(t,e){for(var r,i,n,s,a=t.window;;){if(t.lookahead<=S){if(j(t),t.lookahead<=S&&e===l)return A;if(0===t.lookahead)break}if(t.match_length=0,t.lookahead>=x&&0<t.strstart&&(i=a[n=t.strstart-1])===a[++n]&&i===a[++n]&&i===a[++n]){s=t.strstart+S;do{}while(i===a[++n]&&i===a[++n]&&i===a[++n]&&i===a[++n]&&i===a[++n]&&i===a[++n]&&i===a[++n]&&i===a[++n]&&n<s);t.match_length=S-(s-n),t.match_length>t.lookahead&&(t.match_length=t.lookahead);}if(t.match_length>=x?(r=u._tr_tally(t,1,t.match_length-x),t.lookahead-=t.match_length,t.strstart+=t.match_length,t.match_length=0):(r=u._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++),r&&(N(t,!1),0===t.strm.avail_out))return A}return t.insert=0,e===f?(N(t,!0),0===t.strm.avail_out?O:B):t.last_lit&&(N(t,!1),0===t.strm.avail_out)?A:I}(i,e):h[i.level].func(i,e);if(o!==O&&o!==B||(i.status=666),o===A||o===O)return 0===t.avail_out&&(i.last_flush=-1),m;if(o===I&&(1===e?u._tr_align(i):5!==e&&(u._tr_stored_block(i,0,0,!1),3===e&&(D(i.head),0===i.lookahead&&(i.strstart=0,i.block_start=0,i.insert=0))),F(t),0===t.avail_out))return i.last_flush=-1,m}return e!==f?m:i.wrap<=0?1:(2===i.wrap?(U(i,255&t.adler),U(i,t.adler>>8&255),U(i,t.adler>>16&255),U(i,t.adler>>24&255),U(i,255&t.total_in),U(i,t.total_in>>8&255),U(i,t.total_in>>16&255),U(i,t.total_in>>24&255)):(P(i,t.adler>>>16),P(i,65535&t.adler)),F(t),0<i.wrap&&(i.wrap=-i.wrap),0!==i.pending?m:1)},r.deflateEnd=function(t){var e;return t&&t.state?(e=t.state.status)!==C&&69!==e&&73!==e&&91!==e&&103!==e&&e!==E&&666!==e?R(t,_):(t.state=null,e===E?R(t,-3):m):_},r.deflateSetDictionary=function(t,e){var r,i,n,s,a,o,h,u,l=e.length;if(!t||!t.state)return _;if(2===(s=(r=t.state).wrap)||1===s&&r.status!==C||r.lookahead)return _;for(1===s&&(t.adler=c(t.adler,e,l,0)),r.wrap=0,l>=r.w_size&&(0===s&&(D(r.head),r.strstart=0,r.block_start=0,r.insert=0),u=new d.Buf8(r.w_size),d.arraySet(u,e,l-r.w_size,r.w_size,0),e=u,l=r.w_size),a=t.avail_in,o=t.next_in,h=t.input,t.avail_in=l,t.next_in=0,t.input=e,j(r);r.lookahead>=x;){for(i=r.strstart,n=r.lookahead-(x-1);r.ins_h=(r.ins_h<<r.hash_shift^r.window[i+x-1])&r.hash_mask,r.prev[i&r.w_mask]=r.head[r.ins_h],r.head[r.ins_h]=i,i++,--n;);r.strstart=i,r.lookahead=x-1,j(r);}return r.strstart+=r.lookahead,r.block_start=r.strstart,r.insert=r.lookahead,r.lookahead=0,r.match_length=r.prev_length=x-1,r.match_available=0,t.next_in=o,t.input=h,t.avail_in=a,r.wrap=s,m},r.deflateInfo="pako deflate (from Nodeca project)";},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(t,e,r){e.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1;};},{}],48:[function(t,e,r){e.exports=function(t,e){var r,i,n,s,a,o,h,u,l,f,d,c,p,m,_,g,b,v,y,w,k,x,S,z,C;r=t.state,i=t.next_in,z=t.input,n=i+(t.avail_in-5),s=t.next_out,C=t.output,a=s-(e-t.avail_out),o=s+(t.avail_out-257),h=r.dmax,u=r.wsize,l=r.whave,f=r.wnext,d=r.window,c=r.hold,p=r.bits,m=r.lencode,_=r.distcode,g=(1<<r.lenbits)-1,b=(1<<r.distbits)-1;t:do{p<15&&(c+=z[i++]<<p,p+=8,c+=z[i++]<<p,p+=8),v=m[c&g];e:for(;;){if(c>>>=y=v>>>24,p-=y,0===(y=v>>>16&255))C[s++]=65535&v;else {if(!(16&y)){if(0==(64&y)){v=m[(65535&v)+(c&(1<<y)-1)];continue e}if(32&y){r.mode=12;break t}t.msg="invalid literal/length code",r.mode=30;break t}w=65535&v,(y&=15)&&(p<y&&(c+=z[i++]<<p,p+=8),w+=c&(1<<y)-1,c>>>=y,p-=y),p<15&&(c+=z[i++]<<p,p+=8,c+=z[i++]<<p,p+=8),v=_[c&b];r:for(;;){if(c>>>=y=v>>>24,p-=y,!(16&(y=v>>>16&255))){if(0==(64&y)){v=_[(65535&v)+(c&(1<<y)-1)];continue r}t.msg="invalid distance code",r.mode=30;break t}if(k=65535&v,p<(y&=15)&&(c+=z[i++]<<p,(p+=8)<y&&(c+=z[i++]<<p,p+=8)),h<(k+=c&(1<<y)-1)){t.msg="invalid distance too far back",r.mode=30;break t}if(c>>>=y,p-=y,(y=s-a)<k){if(l<(y=k-y)&&r.sane){t.msg="invalid distance too far back",r.mode=30;break t}if(S=d,(x=0)===f){if(x+=u-y,y<w){for(w-=y;C[s++]=d[x++],--y;);x=s-k,S=C;}}else if(f<y){if(x+=u+f-y,(y-=f)<w){for(w-=y;C[s++]=d[x++],--y;);if(x=0,f<w){for(w-=y=f;C[s++]=d[x++],--y;);x=s-k,S=C;}}}else if(x+=f-y,y<w){for(w-=y;C[s++]=d[x++],--y;);x=s-k,S=C;}for(;2<w;)C[s++]=S[x++],C[s++]=S[x++],C[s++]=S[x++],w-=3;w&&(C[s++]=S[x++],1<w&&(C[s++]=S[x++]));}else {for(x=s-k;C[s++]=C[x++],C[s++]=C[x++],C[s++]=C[x++],2<(w-=3););w&&(C[s++]=C[x++],1<w&&(C[s++]=C[x++]));}break}}break}}while(i<n&&s<o);i-=w=p>>3,c&=(1<<(p-=w<<3))-1,t.next_in=i,t.next_out=s,t.avail_in=i<n?n-i+5:5-(i-n),t.avail_out=s<o?o-s+257:257-(s-o),r.hold=c,r.bits=p;};},{}],49:[function(t,e,r){var I=t("../utils/common"),O=t("./adler32"),B=t("./crc32"),R=t("./inffast"),T=t("./inftrees"),D=1,F=2,N=0,U=-2,P=1,i=852,n=592;function L(t){return (t>>>24&255)+(t>>>8&65280)+((65280&t)<<8)+((255&t)<<24)}function s(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new I.Buf16(320),this.work=new I.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0;}function a(t){var e;return t&&t.state?(e=t.state,t.total_in=t.total_out=e.total=0,t.msg="",e.wrap&&(t.adler=1&e.wrap),e.mode=P,e.last=0,e.havedict=0,e.dmax=32768,e.head=null,e.hold=0,e.bits=0,e.lencode=e.lendyn=new I.Buf32(i),e.distcode=e.distdyn=new I.Buf32(n),e.sane=1,e.back=-1,N):U}function o(t){var e;return t&&t.state?((e=t.state).wsize=0,e.whave=0,e.wnext=0,a(t)):U}function h(t,e){var r,i;return t&&t.state?(i=t.state,e<0?(r=0,e=-e):(r=1+(e>>4),e<48&&(e&=15)),e&&(e<8||15<e)?U:(null!==i.window&&i.wbits!==e&&(i.window=null),i.wrap=r,i.wbits=e,o(t))):U}function u(t,e){var r,i;return t?(i=new s,(t.state=i).window=null,(r=h(t,e))!==N&&(t.state=null),r):U}var l,f,d=!0;function j(t){if(d){var e;for(l=new I.Buf32(512),f=new I.Buf32(32),e=0;e<144;)t.lens[e++]=8;for(;e<256;)t.lens[e++]=9;for(;e<280;)t.lens[e++]=7;for(;e<288;)t.lens[e++]=8;for(T(D,t.lens,0,288,l,0,t.work,{bits:9}),e=0;e<32;)t.lens[e++]=5;T(F,t.lens,0,32,f,0,t.work,{bits:5}),d=!1;}t.lencode=l,t.lenbits=9,t.distcode=f,t.distbits=5;}function Z(t,e,r,i){var n,s=t.state;return null===s.window&&(s.wsize=1<<s.wbits,s.wnext=0,s.whave=0,s.window=new I.Buf8(s.wsize)),i>=s.wsize?(I.arraySet(s.window,e,r-s.wsize,s.wsize,0),s.wnext=0,s.whave=s.wsize):(i<(n=s.wsize-s.wnext)&&(n=i),I.arraySet(s.window,e,r-i,n,s.wnext),(i-=n)?(I.arraySet(s.window,e,r-i,i,0),s.wnext=i,s.whave=s.wsize):(s.wnext+=n,s.wnext===s.wsize&&(s.wnext=0),s.whave<s.wsize&&(s.whave+=n))),0}r.inflateReset=o,r.inflateReset2=h,r.inflateResetKeep=a,r.inflateInit=function(t){return u(t,15)},r.inflateInit2=u,r.inflate=function(t,e){var r,i,n,s,a,o,h,u,l,f,d,c,p,m,_,g,b,v,y,w,k,x,S,z,C=0,E=new I.Buf8(4),A=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!t||!t.state||!t.output||!t.input&&0!==t.avail_in)return U;12===(r=t.state).mode&&(r.mode=13),a=t.next_out,n=t.output,h=t.avail_out,s=t.next_in,i=t.input,o=t.avail_in,u=r.hold,l=r.bits,f=o,d=h,x=N;t:for(;;)switch(r.mode){case P:if(0===r.wrap){r.mode=13;break}for(;l<16;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}if(2&r.wrap&&35615===u){E[r.check=0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0),l=u=0,r.mode=2;break}if(r.flags=0,r.head&&(r.head.done=!1),!(1&r.wrap)||(((255&u)<<8)+(u>>8))%31){t.msg="incorrect header check",r.mode=30;break}if(8!=(15&u)){t.msg="unknown compression method",r.mode=30;break}if(l-=4,k=8+(15&(u>>>=4)),0===r.wbits)r.wbits=k;else if(k>r.wbits){t.msg="invalid window size",r.mode=30;break}r.dmax=1<<k,t.adler=r.check=1,r.mode=512&u?10:12,l=u=0;break;case 2:for(;l<16;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}if(r.flags=u,8!=(255&r.flags)){t.msg="unknown compression method",r.mode=30;break}if(57344&r.flags){t.msg="unknown header flags set",r.mode=30;break}r.head&&(r.head.text=u>>8&1),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0,r.mode=3;case 3:for(;l<32;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}r.head&&(r.head.time=u),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,E[2]=u>>>16&255,E[3]=u>>>24&255,r.check=B(r.check,E,4,0)),l=u=0,r.mode=4;case 4:for(;l<16;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}r.head&&(r.head.xflags=255&u,r.head.os=u>>8),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0,r.mode=5;case 5:if(1024&r.flags){for(;l<16;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}r.length=u,r.head&&(r.head.extra_len=u),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0;}else r.head&&(r.head.extra=null);r.mode=6;case 6:if(1024&r.flags&&(o<(c=r.length)&&(c=o),c&&(r.head&&(k=r.head.extra_len-r.length,r.head.extra||(r.head.extra=new Array(r.head.extra_len)),I.arraySet(r.head.extra,i,s,c,k)),512&r.flags&&(r.check=B(r.check,i,c,s)),o-=c,s+=c,r.length-=c),r.length))break t;r.length=0,r.mode=7;case 7:if(2048&r.flags){if(0===o)break t;for(c=0;k=i[s+c++],r.head&&k&&r.length<65536&&(r.head.name+=String.fromCharCode(k)),k&&c<o;);if(512&r.flags&&(r.check=B(r.check,i,c,s)),o-=c,s+=c,k)break t}else r.head&&(r.head.name=null);r.length=0,r.mode=8;case 8:if(4096&r.flags){if(0===o)break t;for(c=0;k=i[s+c++],r.head&&k&&r.length<65536&&(r.head.comment+=String.fromCharCode(k)),k&&c<o;);if(512&r.flags&&(r.check=B(r.check,i,c,s)),o-=c,s+=c,k)break t}else r.head&&(r.head.comment=null);r.mode=9;case 9:if(512&r.flags){for(;l<16;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}if(u!==(65535&r.check)){t.msg="header crc mismatch",r.mode=30;break}l=u=0;}r.head&&(r.head.hcrc=r.flags>>9&1,r.head.done=!0),t.adler=r.check=0,r.mode=12;break;case 10:for(;l<32;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}t.adler=r.check=L(u),l=u=0,r.mode=11;case 11:if(0===r.havedict)return t.next_out=a,t.avail_out=h,t.next_in=s,t.avail_in=o,r.hold=u,r.bits=l,2;t.adler=r.check=1,r.mode=12;case 12:if(5===e||6===e)break t;case 13:if(r.last){u>>>=7&l,l-=7&l,r.mode=27;break}for(;l<3;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}switch(r.last=1&u,l-=1,3&(u>>>=1)){case 0:r.mode=14;break;case 1:if(j(r),r.mode=20,6!==e)break;u>>>=2,l-=2;break t;case 2:r.mode=17;break;case 3:t.msg="invalid block type",r.mode=30;}u>>>=2,l-=2;break;case 14:for(u>>>=7&l,l-=7&l;l<32;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}if((65535&u)!=(u>>>16^65535)){t.msg="invalid stored block lengths",r.mode=30;break}if(r.length=65535&u,l=u=0,r.mode=15,6===e)break t;case 15:r.mode=16;case 16:if(c=r.length){if(o<c&&(c=o),h<c&&(c=h),0===c)break t;I.arraySet(n,i,s,c,a),o-=c,s+=c,h-=c,a+=c,r.length-=c;break}r.mode=12;break;case 17:for(;l<14;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}if(r.nlen=257+(31&u),u>>>=5,l-=5,r.ndist=1+(31&u),u>>>=5,l-=5,r.ncode=4+(15&u),u>>>=4,l-=4,286<r.nlen||30<r.ndist){t.msg="too many length or distance symbols",r.mode=30;break}r.have=0,r.mode=18;case 18:for(;r.have<r.ncode;){for(;l<3;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}r.lens[A[r.have++]]=7&u,u>>>=3,l-=3;}for(;r.have<19;)r.lens[A[r.have++]]=0;if(r.lencode=r.lendyn,r.lenbits=7,S={bits:r.lenbits},x=T(0,r.lens,0,19,r.lencode,0,r.work,S),r.lenbits=S.bits,x){t.msg="invalid code lengths set",r.mode=30;break}r.have=0,r.mode=19;case 19:for(;r.have<r.nlen+r.ndist;){for(;g=(C=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}if(b<16)u>>>=_,l-=_,r.lens[r.have++]=b;else {if(16===b){for(z=_+2;l<z;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}if(u>>>=_,l-=_,0===r.have){t.msg="invalid bit length repeat",r.mode=30;break}k=r.lens[r.have-1],c=3+(3&u),u>>>=2,l-=2;}else if(17===b){for(z=_+3;l<z;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}l-=_,k=0,c=3+(7&(u>>>=_)),u>>>=3,l-=3;}else {for(z=_+7;l<z;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}l-=_,k=0,c=11+(127&(u>>>=_)),u>>>=7,l-=7;}if(r.have+c>r.nlen+r.ndist){t.msg="invalid bit length repeat",r.mode=30;break}for(;c--;)r.lens[r.have++]=k;}}if(30===r.mode)break;if(0===r.lens[256]){t.msg="invalid code -- missing end-of-block",r.mode=30;break}if(r.lenbits=9,S={bits:r.lenbits},x=T(D,r.lens,0,r.nlen,r.lencode,0,r.work,S),r.lenbits=S.bits,x){t.msg="invalid literal/lengths set",r.mode=30;break}if(r.distbits=6,r.distcode=r.distdyn,S={bits:r.distbits},x=T(F,r.lens,r.nlen,r.ndist,r.distcode,0,r.work,S),r.distbits=S.bits,x){t.msg="invalid distances set",r.mode=30;break}if(r.mode=20,6===e)break t;case 20:r.mode=21;case 21:if(6<=o&&258<=h){t.next_out=a,t.avail_out=h,t.next_in=s,t.avail_in=o,r.hold=u,r.bits=l,R(t,d),a=t.next_out,n=t.output,h=t.avail_out,s=t.next_in,i=t.input,o=t.avail_in,u=r.hold,l=r.bits,12===r.mode&&(r.back=-1);break}for(r.back=0;g=(C=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}if(g&&0==(240&g)){for(v=_,y=g,w=b;g=(C=r.lencode[w+((u&(1<<v+y)-1)>>v)])>>>16&255,b=65535&C,!(v+(_=C>>>24)<=l);){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}u>>>=v,l-=v,r.back+=v;}if(u>>>=_,l-=_,r.back+=_,r.length=b,0===g){r.mode=26;break}if(32&g){r.back=-1,r.mode=12;break}if(64&g){t.msg="invalid literal/length code",r.mode=30;break}r.extra=15&g,r.mode=22;case 22:if(r.extra){for(z=r.extra;l<z;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}r.length+=u&(1<<r.extra)-1,u>>>=r.extra,l-=r.extra,r.back+=r.extra;}r.was=r.length,r.mode=23;case 23:for(;g=(C=r.distcode[u&(1<<r.distbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}if(0==(240&g)){for(v=_,y=g,w=b;g=(C=r.distcode[w+((u&(1<<v+y)-1)>>v)])>>>16&255,b=65535&C,!(v+(_=C>>>24)<=l);){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}u>>>=v,l-=v,r.back+=v;}if(u>>>=_,l-=_,r.back+=_,64&g){t.msg="invalid distance code",r.mode=30;break}r.offset=b,r.extra=15&g,r.mode=24;case 24:if(r.extra){for(z=r.extra;l<z;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}r.offset+=u&(1<<r.extra)-1,u>>>=r.extra,l-=r.extra,r.back+=r.extra;}if(r.offset>r.dmax){t.msg="invalid distance too far back",r.mode=30;break}r.mode=25;case 25:if(0===h)break t;if(c=d-h,r.offset>c){if((c=r.offset-c)>r.whave&&r.sane){t.msg="invalid distance too far back",r.mode=30;break}p=c>r.wnext?(c-=r.wnext,r.wsize-c):r.wnext-c,c>r.length&&(c=r.length),m=r.window;}else m=n,p=a-r.offset,c=r.length;for(h<c&&(c=h),h-=c,r.length-=c;n[a++]=m[p++],--c;);0===r.length&&(r.mode=21);break;case 26:if(0===h)break t;n[a++]=r.length,h--,r.mode=21;break;case 27:if(r.wrap){for(;l<32;){if(0===o)break t;o--,u|=i[s++]<<l,l+=8;}if(d-=h,t.total_out+=d,r.total+=d,d&&(t.adler=r.check=r.flags?B(r.check,n,d,a-d):O(r.check,n,d,a-d)),d=h,(r.flags?u:L(u))!==r.check){t.msg="incorrect data check",r.mode=30;break}l=u=0;}r.mode=28;case 28:if(r.wrap&&r.flags){for(;l<32;){if(0===o)break t;o--,u+=i[s++]<<l,l+=8;}if(u!==(4294967295&r.total)){t.msg="incorrect length check",r.mode=30;break}l=u=0;}r.mode=29;case 29:x=1;break t;case 30:x=-3;break t;case 31:return -4;case 32:default:return U}return t.next_out=a,t.avail_out=h,t.next_in=s,t.avail_in=o,r.hold=u,r.bits=l,(r.wsize||d!==t.avail_out&&r.mode<30&&(r.mode<27||4!==e))&&Z(t,t.output,t.next_out,d-t.avail_out)?(r.mode=31,-4):(f-=t.avail_in,d-=t.avail_out,t.total_in+=f,t.total_out+=d,r.total+=d,r.wrap&&d&&(t.adler=r.check=r.flags?B(r.check,n,d,t.next_out-d):O(r.check,n,d,t.next_out-d)),t.data_type=r.bits+(r.last?64:0)+(12===r.mode?128:0)+(20===r.mode||15===r.mode?256:0),(0==f&&0===d||4===e)&&x===N&&(x=-5),x)},r.inflateEnd=function(t){if(!t||!t.state)return U;var e=t.state;return e.window&&(e.window=null),t.state=null,N},r.inflateGetHeader=function(t,e){var r;return t&&t.state?0==(2&(r=t.state).wrap)?U:((r.head=e).done=!1,N):U},r.inflateSetDictionary=function(t,e){var r,i=e.length;return t&&t.state?0!==(r=t.state).wrap&&11!==r.mode?U:11===r.mode&&O(1,e,i,0)!==r.check?-3:Z(t,e,i,i)?(r.mode=31,-4):(r.havedict=1,N):U},r.inflateInfo="pako inflate (from Nodeca project)";},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(t,e,r){var D=t("../utils/common"),F=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],N=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],U=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],P=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];e.exports=function(t,e,r,i,n,s,a,o){var h,u,l,f,d,c,p,m,_,g=o.bits,b=0,v=0,y=0,w=0,k=0,x=0,S=0,z=0,C=0,E=0,A=null,I=0,O=new D.Buf16(16),B=new D.Buf16(16),R=null,T=0;for(b=0;b<=15;b++)O[b]=0;for(v=0;v<i;v++)O[e[r+v]]++;for(k=g,w=15;1<=w&&0===O[w];w--);if(w<k&&(k=w),0===w)return n[s++]=20971520,n[s++]=20971520,o.bits=1,0;for(y=1;y<w&&0===O[y];y++);for(k<y&&(k=y),b=z=1;b<=15;b++)if(z<<=1,(z-=O[b])<0)return -1;if(0<z&&(0===t||1!==w))return -1;for(B[1]=0,b=1;b<15;b++)B[b+1]=B[b]+O[b];for(v=0;v<i;v++)0!==e[r+v]&&(a[B[e[r+v]]++]=v);if(c=0===t?(A=R=a,19):1===t?(A=F,I-=257,R=N,T-=257,256):(A=U,R=P,-1),b=y,d=s,S=v=E=0,l=-1,f=(C=1<<(x=k))-1,1===t&&852<C||2===t&&592<C)return 1;for(;;){for(p=b-S,_=a[v]<c?(m=0,a[v]):a[v]>c?(m=R[T+a[v]],A[I+a[v]]):(m=96,0),h=1<<b-S,y=u=1<<x;n[d+(E>>S)+(u-=h)]=p<<24|m<<16|_|0,0!==u;);for(h=1<<b-1;E&h;)h>>=1;if(0!==h?(E&=h-1,E+=h):E=0,v++,0==--O[b]){if(b===w)break;b=e[r+a[v]];}if(k<b&&(E&f)!==l){for(0===S&&(S=k),d+=y,z=1<<(x=b-S);x+S<w&&!((z-=O[x+S])<=0);)x++,z<<=1;if(C+=1<<x,1===t&&852<C||2===t&&592<C)return 1;n[l=E&f]=k<<24|x<<16|d-s|0;}}return 0!==E&&(n[d+E]=b-S<<24|64<<16|0),o.bits=k,0};},{"../utils/common":41}],51:[function(t,e,r){e.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"};},{}],52:[function(t,e,r){var n=t("../utils/common"),o=0,h=1;function i(t){for(var e=t.length;0<=--e;)t[e]=0;}var s=0,a=29,u=256,l=u+1+a,f=30,d=19,_=2*l+1,g=15,c=16,p=7,m=256,b=16,v=17,y=18,w=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],k=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],x=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],S=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],z=new Array(2*(l+2));i(z);var C=new Array(2*f);i(C);var E=new Array(512);i(E);var A=new Array(256);i(A);var I=new Array(a);i(I);var O,B,R,T=new Array(f);function D(t,e,r,i,n){this.static_tree=t,this.extra_bits=e,this.extra_base=r,this.elems=i,this.max_length=n,this.has_stree=t&&t.length;}function F(t,e){this.dyn_tree=t,this.max_code=0,this.stat_desc=e;}function N(t){return t<256?E[t]:E[256+(t>>>7)]}function U(t,e){t.pending_buf[t.pending++]=255&e,t.pending_buf[t.pending++]=e>>>8&255;}function P(t,e,r){t.bi_valid>c-r?(t.bi_buf|=e<<t.bi_valid&65535,U(t,t.bi_buf),t.bi_buf=e>>c-t.bi_valid,t.bi_valid+=r-c):(t.bi_buf|=e<<t.bi_valid&65535,t.bi_valid+=r);}function L(t,e,r){P(t,r[2*e],r[2*e+1]);}function j(t,e){for(var r=0;r|=1&t,t>>>=1,r<<=1,0<--e;);return r>>>1}function Z(t,e,r){var i,n,s=new Array(g+1),a=0;for(i=1;i<=g;i++)s[i]=a=a+r[i-1]<<1;for(n=0;n<=e;n++){var o=t[2*n+1];0!==o&&(t[2*n]=j(s[o]++,o));}}function W(t){var e;for(e=0;e<l;e++)t.dyn_ltree[2*e]=0;for(e=0;e<f;e++)t.dyn_dtree[2*e]=0;for(e=0;e<d;e++)t.bl_tree[2*e]=0;t.dyn_ltree[2*m]=1,t.opt_len=t.static_len=0,t.last_lit=t.matches=0;}function M(t){8<t.bi_valid?U(t,t.bi_buf):0<t.bi_valid&&(t.pending_buf[t.pending++]=t.bi_buf),t.bi_buf=0,t.bi_valid=0;}function H(t,e,r,i){var n=2*e,s=2*r;return t[n]<t[s]||t[n]===t[s]&&i[e]<=i[r]}function G(t,e,r){for(var i=t.heap[r],n=r<<1;n<=t.heap_len&&(n<t.heap_len&&H(e,t.heap[n+1],t.heap[n],t.depth)&&n++,!H(e,i,t.heap[n],t.depth));)t.heap[r]=t.heap[n],r=n,n<<=1;t.heap[r]=i;}function K(t,e,r){var i,n,s,a,o=0;if(0!==t.last_lit)for(;i=t.pending_buf[t.d_buf+2*o]<<8|t.pending_buf[t.d_buf+2*o+1],n=t.pending_buf[t.l_buf+o],o++,0===i?L(t,n,e):(L(t,(s=A[n])+u+1,e),0!==(a=w[s])&&P(t,n-=I[s],a),L(t,s=N(--i),r),0!==(a=k[s])&&P(t,i-=T[s],a)),o<t.last_lit;);L(t,m,e);}function Y(t,e){var r,i,n,s=e.dyn_tree,a=e.stat_desc.static_tree,o=e.stat_desc.has_stree,h=e.stat_desc.elems,u=-1;for(t.heap_len=0,t.heap_max=_,r=0;r<h;r++)0!==s[2*r]?(t.heap[++t.heap_len]=u=r,t.depth[r]=0):s[2*r+1]=0;for(;t.heap_len<2;)s[2*(n=t.heap[++t.heap_len]=u<2?++u:0)]=1,t.depth[n]=0,t.opt_len--,o&&(t.static_len-=a[2*n+1]);for(e.max_code=u,r=t.heap_len>>1;1<=r;r--)G(t,s,r);for(n=h;r=t.heap[1],t.heap[1]=t.heap[t.heap_len--],G(t,s,1),i=t.heap[1],t.heap[--t.heap_max]=r,t.heap[--t.heap_max]=i,s[2*n]=s[2*r]+s[2*i],t.depth[n]=(t.depth[r]>=t.depth[i]?t.depth[r]:t.depth[i])+1,s[2*r+1]=s[2*i+1]=n,t.heap[1]=n++,G(t,s,1),2<=t.heap_len;);t.heap[--t.heap_max]=t.heap[1],function(t,e){var r,i,n,s,a,o,h=e.dyn_tree,u=e.max_code,l=e.stat_desc.static_tree,f=e.stat_desc.has_stree,d=e.stat_desc.extra_bits,c=e.stat_desc.extra_base,p=e.stat_desc.max_length,m=0;for(s=0;s<=g;s++)t.bl_count[s]=0;for(h[2*t.heap[t.heap_max]+1]=0,r=t.heap_max+1;r<_;r++)p<(s=h[2*h[2*(i=t.heap[r])+1]+1]+1)&&(s=p,m++),h[2*i+1]=s,u<i||(t.bl_count[s]++,a=0,c<=i&&(a=d[i-c]),o=h[2*i],t.opt_len+=o*(s+a),f&&(t.static_len+=o*(l[2*i+1]+a)));if(0!==m){do{for(s=p-1;0===t.bl_count[s];)s--;t.bl_count[s]--,t.bl_count[s+1]+=2,t.bl_count[p]--,m-=2;}while(0<m);for(s=p;0!==s;s--)for(i=t.bl_count[s];0!==i;)u<(n=t.heap[--r])||(h[2*n+1]!==s&&(t.opt_len+=(s-h[2*n+1])*h[2*n],h[2*n+1]=s),i--);}}(t,e),Z(s,u,t.bl_count);}function X(t,e,r){var i,n,s=-1,a=e[1],o=0,h=7,u=4;for(0===a&&(h=138,u=3),e[2*(r+1)+1]=65535,i=0;i<=r;i++)n=a,a=e[2*(i+1)+1],++o<h&&n===a||(o<u?t.bl_tree[2*n]+=o:0!==n?(n!==s&&t.bl_tree[2*n]++,t.bl_tree[2*b]++):o<=10?t.bl_tree[2*v]++:t.bl_tree[2*y]++,s=n,u=(o=0)===a?(h=138,3):n===a?(h=6,3):(h=7,4));}function V(t,e,r){var i,n,s=-1,a=e[1],o=0,h=7,u=4;for(0===a&&(h=138,u=3),i=0;i<=r;i++)if(n=a,a=e[2*(i+1)+1],!(++o<h&&n===a)){if(o<u)for(;L(t,n,t.bl_tree),0!=--o;);else 0!==n?(n!==s&&(L(t,n,t.bl_tree),o--),L(t,b,t.bl_tree),P(t,o-3,2)):o<=10?(L(t,v,t.bl_tree),P(t,o-3,3)):(L(t,y,t.bl_tree),P(t,o-11,7));s=n,u=(o=0)===a?(h=138,3):n===a?(h=6,3):(h=7,4);}}i(T);var q=!1;function J(t,e,r,i){P(t,(s<<1)+(i?1:0),3),function(t,e,r,i){M(t),i&&(U(t,r),U(t,~r)),n.arraySet(t.pending_buf,t.window,e,r,t.pending),t.pending+=r;}(t,e,r,!0);}r._tr_init=function(t){q||(function(){var t,e,r,i,n,s=new Array(g+1);for(i=r=0;i<a-1;i++)for(I[i]=r,t=0;t<1<<w[i];t++)A[r++]=i;for(A[r-1]=i,i=n=0;i<16;i++)for(T[i]=n,t=0;t<1<<k[i];t++)E[n++]=i;for(n>>=7;i<f;i++)for(T[i]=n<<7,t=0;t<1<<k[i]-7;t++)E[256+n++]=i;for(e=0;e<=g;e++)s[e]=0;for(t=0;t<=143;)z[2*t+1]=8,t++,s[8]++;for(;t<=255;)z[2*t+1]=9,t++,s[9]++;for(;t<=279;)z[2*t+1]=7,t++,s[7]++;for(;t<=287;)z[2*t+1]=8,t++,s[8]++;for(Z(z,l+1,s),t=0;t<f;t++)C[2*t+1]=5,C[2*t]=j(t,5);O=new D(z,w,u+1,l,g),B=new D(C,k,0,f,g),R=new D(new Array(0),x,0,d,p);}(),q=!0),t.l_desc=new F(t.dyn_ltree,O),t.d_desc=new F(t.dyn_dtree,B),t.bl_desc=new F(t.bl_tree,R),t.bi_buf=0,t.bi_valid=0,W(t);},r._tr_stored_block=J,r._tr_flush_block=function(t,e,r,i){var n,s,a=0;0<t.level?(2===t.strm.data_type&&(t.strm.data_type=function(t){var e,r=4093624447;for(e=0;e<=31;e++,r>>>=1)if(1&r&&0!==t.dyn_ltree[2*e])return o;if(0!==t.dyn_ltree[18]||0!==t.dyn_ltree[20]||0!==t.dyn_ltree[26])return h;for(e=32;e<u;e++)if(0!==t.dyn_ltree[2*e])return h;return o}(t)),Y(t,t.l_desc),Y(t,t.d_desc),a=function(t){var e;for(X(t,t.dyn_ltree,t.l_desc.max_code),X(t,t.dyn_dtree,t.d_desc.max_code),Y(t,t.bl_desc),e=d-1;3<=e&&0===t.bl_tree[2*S[e]+1];e--);return t.opt_len+=3*(e+1)+5+5+4,e}(t),n=t.opt_len+3+7>>>3,(s=t.static_len+3+7>>>3)<=n&&(n=s)):n=s=r+5,r+4<=n&&-1!==e?J(t,e,r,i):4===t.strategy||s===n?(P(t,2+(i?1:0),3),K(t,z,C)):(P(t,4+(i?1:0),3),function(t,e,r,i){var n;for(P(t,e-257,5),P(t,r-1,5),P(t,i-4,4),n=0;n<i;n++)P(t,t.bl_tree[2*S[n]+1],3);V(t,t.dyn_ltree,e-1),V(t,t.dyn_dtree,r-1);}(t,t.l_desc.max_code+1,t.d_desc.max_code+1,a+1),K(t,t.dyn_ltree,t.dyn_dtree)),W(t),i&&M(t);},r._tr_tally=function(t,e,r){return t.pending_buf[t.d_buf+2*t.last_lit]=e>>>8&255,t.pending_buf[t.d_buf+2*t.last_lit+1]=255&e,t.pending_buf[t.l_buf+t.last_lit]=255&r,t.last_lit++,0===e?t.dyn_ltree[2*r]++:(t.matches++,e--,t.dyn_ltree[2*(A[r]+u+1)]++,t.dyn_dtree[2*N(e)]++),t.last_lit===t.lit_bufsize-1},r._tr_align=function(t){P(t,2,3),L(t,m,z),function(t){16===t.bi_valid?(U(t,t.bi_buf),t.bi_buf=0,t.bi_valid=0):8<=t.bi_valid&&(t.pending_buf[t.pending++]=255&t.bi_buf,t.bi_buf>>=8,t.bi_valid-=8);}(t);};},{"../utils/common":41}],53:[function(t,e,r){e.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0;};},{}],54:[function(t,e,r){e.exports="function"==typeof setImmediate?setImmediate:function(){var t=[].slice.apply(arguments);t.splice(1,0,0),setTimeout.apply(null,t);};},{}]},{},[10])(10)});
    } (jszip_min));

    var JSZip = jszip_min.exports;

    var css_248z$y = "div.svelte-lt5zc0{background-color:var(--figma-color-bg)}div.svelte-lt5zc0:hover{background-color:var(--figma-color-bg-secondary)}";
    styleInject(css_248z$y);

    /* src/lib/components/Inputs/HoverIcon.svelte generated by Svelte v3.48.0 */
    const file$k = "src/lib/components/Inputs/HoverIcon.svelte";

    function create_fragment$k(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "flex items-center justify-center py-4 px-[11px] cursor-pointer h-4 transition-all rounded-full svelte-lt5zc0");
    			toggle_class(div, "aspect-square", !/*text*/ ctx[0]);
    			add_location(div, file$k, 12, 0, 200);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*onClick*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[2],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
    						null
    					);
    				}
    			}

    			if (dirty & /*text*/ 1) {
    				toggle_class(div, "aspect-square", !/*text*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HoverIcon', slots, ['default']);
    	let { text = false } = $$props;
    	const dispatch = createEventDispatcher();

    	const onClick = () => {
    		dispatch("onClick");
    	};

    	const writable_props = ['text'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HoverIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		text,
    		dispatch,
    		onClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, onClick, $$scope, slots];
    }

    class HoverIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, { text: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HoverIcon",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get text() {
    		throw new Error("<HoverIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<HoverIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$x = ".panel.svelte-10m1wkd{border-bottom:1px solid var(--figma-color-border)}";
    styleInject(css_248z$x);

    /* src/lib/components/Layout/Panel.svelte generated by Svelte v3.48.0 */
    const file$j = "src/lib/components/Layout/Panel.svelte";
    const get_button_slot_changes = dirty => ({});
    const get_button_slot_context = ctx => ({});

    // (24:6) {:else}
    function create_else_block$3(ctx) {
    	let hovericon;
    	let current;

    	hovericon = new HoverIcon({
    			props: {
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(hovericon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(hovericon, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hovericon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hovericon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(hovericon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(24:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (20:6) {#if expanded}
    function create_if_block_1$4(ctx) {
    	let hovericon;
    	let current;

    	hovericon = new HoverIcon({
    			props: {
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(hovericon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(hovericon, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hovericon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hovericon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(hovericon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(20:6) {#if expanded}",
    		ctx
    	});

    	return block;
    }

    // (25:8) <HoverIcon>
    function create_default_slot_1$3(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "fa-sharp fa-solid fa-caret-right");
    			add_location(i, file$j, 25, 10, 715);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(25:8) <HoverIcon>",
    		ctx
    	});

    	return block;
    }

    // (21:8) <HoverIcon>
    function create_default_slot$4(ctx) {
    	let i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "fa-sharp fa-solid fa-caret-down");
    			add_location(i, file$j, 21, 10, 604);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(21:8) <HoverIcon>",
    		ctx
    	});

    	return block;
    }

    // (34:2) {#if expanded}
    function create_if_block$a(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "mt-4");
    			add_location(div, file$j, 34, 4, 915);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(34:2) {#if expanded}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let h3;
    	let t1;
    	let t2;
    	let t3;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1$4, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*expanded*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const button_slot_template = /*#slots*/ ctx[4].button;
    	const button_slot = create_slot(button_slot_template, ctx, /*$$scope*/ ctx[5], get_button_slot_context);
    	let if_block1 = /*expanded*/ ctx[0] && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			h3 = element("h3");
    			t1 = text(/*title*/ ctx[2]);
    			t2 = space();
    			if (button_slot) button_slot.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(h3, "class", "text-base font-bold");
    			add_location(h3, file$j, 28, 6, 801);
    			attr_dev(div0, "class", "flex items-center gap-4");
    			add_location(div0, file$j, 18, 4, 489);
    			attr_dev(div1, "class", "flex items-center justify-between transition-all cursor-pointer hover:opacity-80");
    			add_location(div1, file$j, 17, 2, 390);
    			attr_dev(div2, "class", "w-full p-4 svelte-10m1wkd");
    			toggle_class(div2, "panel", /*border*/ ctx[1]);
    			add_location(div2, file$j, 16, 0, 342);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			append_dev(div0, t0);
    			append_dev(div0, h3);
    			append_dev(h3, t1);
    			append_dev(div1, t2);

    			if (button_slot) {
    				button_slot.m(div1, null);
    			}

    			append_dev(div2, t3);
    			if (if_block1) if_block1.m(div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*toggleExpanded*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(div0, t0);
    			}

    			if (!current || dirty & /*title*/ 4) set_data_dev(t1, /*title*/ ctx[2]);

    			if (button_slot) {
    				if (button_slot.p && (!current || dirty & /*$$scope*/ 32)) {
    					update_slot_base(
    						button_slot,
    						button_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(button_slot_template, /*$$scope*/ ctx[5], dirty, get_button_slot_changes),
    						get_button_slot_context
    					);
    				}
    			}

    			if (/*expanded*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*expanded*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$a(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div2, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*border*/ 2) {
    				toggle_class(div2, "panel", /*border*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(button_slot, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(button_slot, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if_blocks[current_block_type_index].d();
    			if (button_slot) button_slot.d(detaching);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Panel', slots, ['button','default']);
    	const dispatch = createEventDispatcher();
    	let { border = true } = $$props;
    	let { expanded = false } = $$props;
    	let { title } = $$props;

    	const toggleExpanded = () => {
    		$$invalidate(0, expanded = !expanded);
    		dispatch("changeView");
    	};

    	const writable_props = ['border', 'expanded', 'title'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Panel> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('border' in $$props) $$invalidate(1, border = $$props.border);
    		if ('expanded' in $$props) $$invalidate(0, expanded = $$props.expanded);
    		if ('title' in $$props) $$invalidate(2, title = $$props.title);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		HoverIcon,
    		dispatch,
    		border,
    		expanded,
    		title,
    		toggleExpanded
    	});

    	$$self.$inject_state = $$props => {
    		if ('border' in $$props) $$invalidate(1, border = $$props.border);
    		if ('expanded' in $$props) $$invalidate(0, expanded = $$props.expanded);
    		if ('title' in $$props) $$invalidate(2, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [expanded, border, title, toggleExpanded, slots, $$scope];
    }

    class Panel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { border: 1, expanded: 0, title: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Panel",
    			options,
    			id: create_fragment$j.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[2] === undefined && !('title' in props)) {
    			console.warn("<Panel> was created without expected prop 'title'");
    		}
    	}

    	get border() {
    		throw new Error("<Panel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set border(value) {
    		throw new Error("<Panel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get expanded() {
    		throw new Error("<Panel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expanded(value) {
    		throw new Error("<Panel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Panel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Panel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    var css_248z$w = ":root{--blue:#18a0fb;--purple:#7b61ff;--hot-pink:#f0f;--green:#1bc47d;--red:#f24822;--yellow:#ffeb00;--black:#000;--black8:rgba(0,0,0,.8);--black8-opaque:#333;--black3:rgba(0,0,0,.3);--black3-opaque:#b3b3b3;--white:#fff;--white8:hsla(0,0%,100%,.8);--white4:hsla(0,0%,100%,.4);--grey:#f0f0f0;--silver:#e5e5e5;--hud:#222;--toolbar:#2c2c2c;--black1:rgba(0,0,0,.1);--blue3:rgba(24,145,251,.3);--purple4:rgba(123,97,255,.4);--hover-fill:rgba(0,0,0,.06);--selection-a:#daebf7;--selection-b:#edf5fa;--white2:hsla(0,0%,100%,.2);--font-stack:\"Inter\",sans-serif;--font-size-xsmall:11px;--font-size-small:12px;--font-size-large:13px;--font-size-xlarge:14px;--font-weight-normal:400;--font-weight-medium:500;--font-weight-bold:600;--font-line-height:16px;--font-line-height-large:24px;--font-letter-spacing-pos-xsmall:.005em;--font-letter-spacing-neg-xsmall:.01em;--font-letter-spacing-pos-small:0;--font-letter-spacing-neg-small:.005em;--font-letter-spacing-pos-large:-.0025em;--font-letter-spacing-neg-large:.0025em;--font-letter-spacing-pos-xlarge:-.001em;--font-letter-spacing-neg-xlarge:-.001em;--border-radius-small:2px;--border-radius-med:5px;--border-radius-large:6px;--shadow-hud:0 5px 17px rgba(0,0,0,.2),0 2px 7px rgba(0,0,0,.15);--shadow-floating-window:0 2px 14px rgba(0,0,0,.15);--size-xxxsmall:4px;--size-xxsmall:8px;--size-xsmall:16px;--size-small:24px;--size-medium:32px;--size-large:40px;--size-xlarge:48px;--size-xxlarge:64px;--size-huge:80px}*,body{box-sizing:border-box}body{font-family:Inter,sans-serif;margin:0;padding:0;position:relative}@font-face{font-family:Inter;font-style:normal;font-weight:400;src:url(https://rsms.me/inter/font-files/Inter-Regular.woff2?v=3.7) format(\"woff2\"),url(https://rsms.me/inter/font-files/Inter-Regular.woff?v=3.7) format(\"woff\")}@font-face{font-family:Inter;font-style:normal;font-weight:500;src:url(https://rsms.me/inter/font-files/Inter-Medium.woff2?v=3.7) format(\"woff2\"),url(https://rsms.me/inter/font-files/Inter-Medium.woff2?v=3.7) format(\"woff\")}@font-face{font-family:Inter;font-style:normal;font-weight:600;src:url(https://rsms.me/inter/font-files/Inter-SemiBold.woff2?v=3.7) format(\"woff2\"),url(https://rsms.me/inter/font-files/Inter-SemiBold.woff2?v=3.7) format(\"woff\")}a{cursor:pointer;text-decoration:none}a,a:active,a:hover{color:var(--blue)}a:focus{text-decoration:underline}.p-xxxsmall{padding:var(--size-xxxsmall)}.p-xxsmall{padding:var(--size-xxsmall)}.p-xsmall{padding:var(--size-xsmall)}.p-small{padding:var(--size-small)}.p-medium{padding:var(--size-medium)}.p-large{padding:var(--size-large)}.p-xlarge{padding:var(--size-xlarge)}.p-xxlarge{padding:var(--size-xxlarge)}.p-huge{padding:var(--size-huge)}.pt-xxxsmall{padding-top:var(--size-xxxsmall)}.pt-xxsmall{padding-top:var(--size-xxsmall)}.pt-xsmall{padding-top:var(--size-xsmall)}.pt-small{padding-top:var(--size-small)}.pt-medium{padding-top:var(--size-medium)}.pt-large{padding-top:var(--size-large)}.pt-xlarge{padding-top:var(--size-xlarge)}.pt-xxlarge{padding-top:var(--size-xxlarge)}.pt-huge{padding-top:var(--size-huge)}.pr-xxxsmall{padding-right:var(--size-xxxsmall)}.pr-xxsmall{padding-right:var(--size-xxsmall)}.pr-xsmall{padding-right:var(--size-xsmall)}.pr-small{padding-right:var(--size-small)}.pr-medium{padding-right:var(--size-medium)}.pr-large{padding-right:var(--size-large)}.pr-xlarge{padding-right:var(--size-xlarge)}.pr-xxlarge{padding-right:var(--size-xxlarge)}.pr-huge{padding-right:var(--size-huge)}.pb-xxxsmall{padding-bottom:var(--size-xxxsmall)}.pb-xxsmall{padding-bottom:var(--size-xxsmall)}.pb-xsmall{padding-bottom:var(--size-xsmall)}.pb-small{padding-bottom:var(--size-small)}.pb-medium{padding-bottom:var(--size-medium)}.pb-large{padding-bottom:var(--size-large)}.pb-xlarge{padding-bottom:var(--size-xlarge)}.pb-xxlarge{padding-bottom:var(--size-xxlarge)}.pb-huge{padding-bottom:var(--size-huge)}.pl-xxxsmall{padding-left:var(--size-xxxsmall)}.pl-xxsmall{padding-left:var(--size-xxsmall)}.pl-xsmall{padding-left:var(--size-xsmall)}.pl-small{padding-left:var(--size-small)}.pl-medium{padding-left:var(--size-medium)}.pl-large{padding-left:var(--size-large)}.pl-xlarge{padding-left:var(--size-xlarge)}.pl-xxlarge{padding-left:var(--size-xxlarge)}.pl-huge{padding-left:var(--size-huge)}.m-xxxsmall{margin:var(--size-xxxsmall)}.m-xxsmall{margin:var(--size-xxsmall)}.m-xsmall{margin:var(--size-xsmall)}.m-small{margin:var(--size-small)}.m-medium{margin:var(--size-medium)}.m-large{margin:var(--size-large)}.m-xlarge{margin:var(--size-xlarge)}.m-xxlarge{margin:var(--size-xxlarge)}.m-huge{margin:var(--size-huge)}.mt-xxxsmall{margin-top:var(--size-xxxsmall)}.mt-xxsmall{margin-top:var(--size-xxsmall)}.mt-xsmall{margin-top:var(--size-xsmall)}.mt-small{margin-top:var(--size-small)}.mt-medium{margin-top:var(--size-medium)}.mt-large{margin-top:var(--size-large)}.mt-xlarge{margin-top:var(--size-xlarge)}.mt-xxlarge{margin-top:var(--size-xxlarge)}.mt-huge{margin-top:var(--size-huge)}.mr-xxxsmall{margin-right:var(--size-xxxsmall)}.mr-xxsmall{margin-right:var(--size-xxsmall)}.mr-xsmall{margin-right:var(--size-xsmall)}.mr-small{margin-right:var(--size-small)}.mr-medium{margin-right:var(--size-medium)}.mr-large{margin-right:var(--size-large)}.mr-xlarge{margin-right:var(--size-xlarge)}.mr-xxlarge{margin-right:var(--size-xxlarge)}.mr-huge{margin-right:var(--size-huge)}.mb-xxxsmall{margin-bottom:var(--size-xxxsmall)}.mb-xxsmall{margin-bottom:var(--size-xxsmall)}.mb-xsmall{margin-bottom:var(--size-xsmall)}.mb-small{margin-bottom:var(--size-small)}.mb-medium{margin-bottom:var(--size-medium)}.mb-large{margin-bottom:var(--size-large)}.mb-xlarge{margin-bottom:var(--size-xlarge)}.mb-xxlarge{margin-bottom:var(--size-xxlarge)}.mb-huge{margin-bottom:var(--size-huge)}.ml-xxxsmall{margin-left:var(--size-xxxsmall)}.ml-xxsmall{margin-left:var(--size-xxsmall)}.ml-xsmall{margin-left:var(--size-xsmall)}.ml-small{margin-left:var(--size-small)}.ml-medium{margin-left:var(--size-medium)}.ml-large{margin-left:var(--size-large)}.ml-xlarge{margin-left:var(--size-xlarge)}.ml-xxlarge{margin-left:var(--size-xxlarge)}.ml-huge{margin-left:var(--size-huge)}.hidden{display:none}.inline{display:inline}.block{display:block}.inline-block{display:inline-block}.flex{display:flex}.inline-flex{display:inline-flex}.column{flex-direction:column}.column-reverse{flex-direction:column-reverse}.row{flex-direction:row}.row-reverse{flex-direction:row-reverse}.flex-wrap{flex-wrap:wrap}.flex-wrap-reverse{flex-wrap:wrap-reverse}.flex-no-wrap{flex-wrap:nowrap}.flex-shrink{flex-shrink:1}.flex-no-shrink{flex-shrink:0}.flex-grow{flex-grow:1}.flex-no-grow{flex-grow:0}.justify-content-start{justify-content:flex-start}.justify-content-end{justify-content:flex-end}.justify-content-center{justify-content:center}.justify-content-between{justify-content:space-between}.justify-content-around{justify-content:space-around}.align-items-start{align-items:flex-start}.align-items-end{align-items:flex-end}.align-items-center{align-items:center}.align-items-stretch{align-items:stretch}.align-content-start{align-content:flex-start}.align-content-end{align-content:flex-end}.align-content-center{align-content:center}.align-content-stretch{align-content:stretch}.align-self-start{align-self:flex-start}.align-self-end{align-self:flex-end}.align-self-center{align-self:center}.align-self-stretch{align-self:stretch}";
    styleInject(css_248z$w);

    var css_248z$v = "button.svelte-18m87pq{align-items:center;border:2px solid transparent;border-radius:var(--border-radius-large);color:var(--white);display:flex;flex-shrink:0;font-family:var(--font-stack);font-size:var(--font-size-xsmall);font-weight:var(--font-weight-medium);height:var(--size-medium);letter-spacing:var(--font-letter-spacing-neg-small);line-height:var(--font-line-height);outline:none;padding:0 var(--size-xsmall) 0 var(--size-xsmall);text-decoration:none;-webkit-user-select:none;-moz-user-select:none;user-select:none}.primary.svelte-18m87pq{background-color:var(--blue);color:var(--white)}.primary.svelte-18m87pq:enabled:active,.primary.svelte-18m87pq:enabled:focus{border:2px solid var(--black3)}.primary.svelte-18m87pq:disabled{background-color:var(--black3)}.primary.destructive.svelte-18m87pq{background-color:var(--red)}.primary.destructive.svelte-18m87pq:disabled{opacity:.4}.secondary.svelte-18m87pq{background-color:var(--white);border:1px solid var(--black8);color:var(--black8);letter-spacing:var(--font-letter-spacing-pos-small);padding:0 calc(var(--size-xsmall) + 1px) 0 calc(var(--size-xsmall) + 1px)}.secondary.svelte-18m87pq:enabled:active,.secondary.svelte-18m87pq:enabled:focus{border:2px solid var(--blue);padding:0 var(--size-xsmall) 0 var(--size-xsmall)}.secondary.svelte-18m87pq:disabled{border:1px solid var(--black3);color:var(--black3)}.secondary.destructive.svelte-18m87pq{border-color:var(--red);color:var(--red)}.secondary.destructive.svelte-18m87pq:enabled:active,.secondary.destructive.svelte-18m87pq:enabled:focus{border:2px solid var(--red);padding:0 var(--size-xsmall) 0 var(--size-xsmall)}.secondary.destructive.svelte-18m87pq:disabled{opacity:.4}.tertiary.svelte-18m87pq{background:initial;border:1px solid transparent;color:var(--blue);cursor:pointer;font-weight:var(--font-weight-normal);letter-spacing:var(--font-letter-spacing-pos-small);padding:0}.tertiary.svelte-18m87pq:enabled:focus{text-decoration:underline}.tertiary.svelte-18m87pq:disabled{color:var(--black3)}.tertiary.destructive.svelte-18m87pq{color:var(--red)}.tertiary.destructive.svelte-18m87pq:enabled:focus{text-decoration:underline}.tertiary.destructive.svelte-18m87pq:disabled{opacity:.4}";
    styleInject(css_248z$v);

    var css_248z$u = "div.svelte-5upx45.svelte-5upx45{align-items:center;cursor:default;display:flex;position:relative}input.svelte-5upx45.svelte-5upx45{flex-shrink:0;height:10px;margin:0;opacity:0;padding:0;width:10px}input.svelte-5upx45:checked+label.svelte-5upx45:before{background-color:var(--blue);background-image:url(\"data:image/svg+xml;utf8,%3Csvg%20fill%3D%22none%22%20height%3D%227%22%20viewBox%3D%220%200%208%207%22%20width%3D%228%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20clip-rule%3D%22evenodd%22%20d%3D%22m1.17647%201.88236%201.88235%201.88236%203.76471-3.76472%201.17647%201.17648-4.94118%204.9412-3.05882-3.05884z%22%20fill%3D%22%23fff%22%20fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E\");background-position:1px 2px;background-repeat:no-repeat;border:1px solid var(--blue)}input.svelte-5upx45:disabled+label.svelte-5upx45{color:var(--black);opacity:.3}input.svelte-5upx45:checked:disabled+label.svelte-5upx45:before{background-color:var(--black8);border:1px solid transparent}label.svelte-5upx45.svelte-5upx45{color:var(--black8);display:flex;font-family:var(--font-stack);font-size:var(--font-size-xsmall);font-weight:var(--font-weight-normal);letter-spacing:var(--font-letter-spacing-pos-xsmall);line-height:var(--font-line-height);margin-left:-16px;padding:var(--size-xxsmall) var(--size-xsmall) var(--size-xxsmall) var(--size-small);-webkit-user-select:none;-moz-user-select:none;user-select:none}label.svelte-5upx45.svelte-5upx45:before{border:1px solid var(--black8);border-radius:var(--border-radius-small);content:\"\";display:block;flex-shrink:0;height:10px;margin:2px 10px 0 -8px;width:10px}input.svelte-5upx45:enabled:checked:focus+label.svelte-5upx45:before{border:1px solid var(--white);border-radius:var(--border-radius-small);box-shadow:0 0 0 2px var(--blue)}input.svelte-5upx45:enabled:focus+label.svelte-5upx45:before{border:1px solid var(--blue);box-shadow:0 0 0 1px var(--blue)}";
    styleInject(css_248z$u);

    var css_248z$t = ".icon-component.svelte-bt3uk2{align-items:center;cursor:default;display:flex;font-family:var(--font-stack);font-size:var(--font-size-xsmall);height:var(--size-medium);justify-content:center;-webkit-user-select:none;-moz-user-select:none;user-select:none;width:var(--size-medium)}.spin.svelte-bt3uk2{animation:svelte-bt3uk2-rotating 1s linear infinite}@keyframes svelte-bt3uk2-rotating{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}.icon-component *{fill:inherit;color:inherit}";
    styleInject(css_248z$t);

    /* node_modules/figma-plugin-ds-svelte/src/components/Icon/index.svelte generated by Svelte v3.48.0 */

    const file$i = "node_modules/figma-plugin-ds-svelte/src/components/Icon/index.svelte";

    // (20:4) {:else}
    function create_else_block$2(ctx) {
    	let html_tag;
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(false);
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(/*iconName*/ ctx[0], target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*iconName*/ 1) html_tag.p(/*iconName*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(20:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (18:4) {#if iconText}
    function create_if_block$9(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*iconText*/ ctx[2]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*iconText*/ 4) set_data_dev(t, /*iconText*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(18:4) {#if iconText}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let div;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*iconText*/ ctx[2]) return create_if_block$9;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "icontext", /*iconText*/ ctx[2]);
    			attr_dev(div, "iconname", /*iconName*/ ctx[0]);
    			attr_dev(div, "class", div_class_value = "icon-component " + /*className*/ ctx[4] + " svelte-bt3uk2");
    			set_style(div, "color", "var(--" + /*color*/ ctx[3] + ")");
    			set_style(div, "fill", "var(--" + /*color*/ ctx[3] + ")");
    			toggle_class(div, "spin", /*spin*/ ctx[1]);
    			add_location(div, file$i, 10, 0, 266);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty & /*iconText*/ 4) {
    				attr_dev(div, "icontext", /*iconText*/ ctx[2]);
    			}

    			if (dirty & /*iconName*/ 1) {
    				attr_dev(div, "iconname", /*iconName*/ ctx[0]);
    			}

    			if (dirty & /*className*/ 16 && div_class_value !== (div_class_value = "icon-component " + /*className*/ ctx[4] + " svelte-bt3uk2")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*color*/ 8) {
    				set_style(div, "color", "var(--" + /*color*/ ctx[3] + ")");
    			}

    			if (dirty & /*color*/ 8) {
    				set_style(div, "fill", "var(--" + /*color*/ ctx[3] + ")");
    			}

    			if (dirty & /*className, spin*/ 18) {
    				toggle_class(div, "spin", /*spin*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icon', slots, []);
    	let { iconName = null } = $$props;
    	let { spin = false } = $$props;
    	let { iconText = null } = $$props;
    	let { color = "black8" } = $$props;
    	let { class: className = '' } = $$props;
    	const writable_props = ['iconName', 'spin', 'iconText', 'color', 'class'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('iconName' in $$props) $$invalidate(0, iconName = $$props.iconName);
    		if ('spin' in $$props) $$invalidate(1, spin = $$props.spin);
    		if ('iconText' in $$props) $$invalidate(2, iconText = $$props.iconText);
    		if ('color' in $$props) $$invalidate(3, color = $$props.color);
    		if ('class' in $$props) $$invalidate(4, className = $$props.class);
    	};

    	$$self.$capture_state = () => ({
    		iconName,
    		spin,
    		iconText,
    		color,
    		className
    	});

    	$$self.$inject_state = $$props => {
    		if ('iconName' in $$props) $$invalidate(0, iconName = $$props.iconName);
    		if ('spin' in $$props) $$invalidate(1, spin = $$props.spin);
    		if ('iconText' in $$props) $$invalidate(2, iconText = $$props.iconText);
    		if ('color' in $$props) $$invalidate(3, color = $$props.color);
    		if ('className' in $$props) $$invalidate(4, className = $$props.className);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [iconName, spin, iconText, color, className, click_handler];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {
    			iconName: 0,
    			spin: 1,
    			iconText: 2,
    			color: 3,
    			class: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$i.name
    		});
    	}

    	get iconName() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconName(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spin() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spin(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconText() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconText(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$s = "li.svelte-5g0hcf.svelte-5g0hcf{border-bottom:1px solid var(--silver);display:flex;flex-direction:column;list-style-type:none;margin:0;padding:0;position:relative;width:100%}li.svelte-5g0hcf.svelte-5g0hcf:last-child{border-bottom:1px solid transparent}.header.svelte-5g0hcf.svelte-5g0hcf{align-items:center;color:var(--black8);display:flex;font-size:var(--font-size-xsmall);font-weight:var(--font-weight-normal);height:var(--size-medium);letter-spacing:var( --font-letter-spacing-pos-xsmall);line-height:var(--line-height)}.header.svelte-5g0hcf:hover .icon.svelte-5g0hcf{opacity:.8}.title.svelte-5g0hcf.svelte-5g0hcf{margin-left:-4px;-webkit-user-select:none;-moz-user-select:none;user-select:none}.icon.svelte-5g0hcf.svelte-5g0hcf{margin-left:-4px;opacity:.3}.expanded.svelte-5g0hcf .icon.svelte-5g0hcf{opacity:.8}.section.svelte-5g0hcf.svelte-5g0hcf{font-weight:var(--font-weight-bold)}.content.svelte-5g0hcf.svelte-5g0hcf{color:var(--black8);display:none;font-size:var(--font-size-xsmall);font-weight:var(--font-weight-normal);letter-spacing:var( --font-letter-spacing-pos-xsmall);line-height:var(--line-height);padding:var(--size-xxsmall) var(--size-xxsmall) var(--size-xxsmall) var(--size-small);pointer-events:none;-webkit-user-select:none;-moz-user-select:none;user-select:none}.expanded.svelte-5g0hcf .content.svelte-5g0hcf{display:block}";
    styleInject(css_248z$s);

    var css_248z$r = "ul.svelte-1x08n8s{list-style-type:none;margin:0;padding:0;position:relative;width:100%}";
    styleInject(css_248z$r);

    var css_248z$q = "div.svelte-jksvsv{align-items:center;border:2px solid transparent;border-radius:var(--border-radius-small);cursor:pointer;display:flex;height:var(--size-medium);justify-content:center;width:var(--size-medium)}div.svelte-jksvsv:hover{background:var(--hover-fill)}div.svelte-jksvsv:active,div.svelte-jksvsv:focus{border:2px solid var(--blue);outline:none}.selected.svelte-jksvsv,.selected.svelte-jksvsv:hover{background-color:var(--blue)}.selected.svelte-jksvsv:active,.selected.svelte-jksvsv:focus{border:2px solid var(--black3)}";
    styleInject(css_248z$q);

    var css_248z$p = ".input.svelte-7iawum{position:relative;transition:flex 0s .2s}input.svelte-7iawum{align-items:center;background-color:var(--white);border:1px solid transparent;border-radius:var(--border-radius-small);color:var(--black8);display:flex;font-size:var(--font-size-xsmall);font-weight:var(--font-weight-normal);height:30px;letter-spacing:var( --font-letter-spacing-neg-xsmall);line-height:var(--line-height);margin:1px 0;outline:none;overflow:visible;padding:var(--size-xxsmall) var(--size-xxxsmall) var(--size-xxsmall) var(--size-xxsmall);position:relative;width:100%}input.svelte-7iawum:-moz-placeholder-shown:hover{background-image:none;border:1px solid var(--black1);color:var(--black8)}input.svelte-7iawum:hover,input.svelte-7iawum:placeholder-shown:hover{background-image:none;border:1px solid var(--black1);color:var(--black8)}input.svelte-7iawum::-moz-selection{background-color:var(--blue3);color:var(--black)}input.svelte-7iawum::selection{background-color:var(--blue3);color:var(--black)}input.svelte-7iawum::-moz-placeholder{border:1px solid transparent;color:var(--black3)}input.svelte-7iawum::placeholder{border:1px solid transparent;color:var(--black3)}input.svelte-7iawum:-moz-placeholder-shown{background-image:none;border:1px solid var(--black1);color:var(--black8)}input.svelte-7iawum:placeholder-shown{background-image:none;border:1px solid var(--black1);color:var(--black8)}input.svelte-7iawum:focus:-moz-placeholder-shown{border:1px solid var(--blue);outline:1px solid var(--blue);outline-offset:-2px}input.svelte-7iawum:focus:placeholder-shown{border:1px solid var(--blue);outline:1px solid var(--blue);outline-offset:-2px}input.svelte-7iawum:disabled:hover{border:1px solid transparent}input.svelte-7iawum:active,input.svelte-7iawum:focus{border:1px solid var(--blue);color:var(--black);outline:1px solid var(--blue);outline-offset:-2px}input.svelte-7iawum:disabled{background-image:none;color:var(--black3);position:relative}input.svelte-7iawum:disabled:active{outline:none}.borders.svelte-7iawum{background-image:none;border:1px solid var(--black1)}.borders.svelte-7iawum:disabled{background-image:none;border:1px solid transparent}.borders.svelte-7iawum:disabled:-moz-placeholder-shown{background-image:none;border:1px solid transparent}.borders.svelte-7iawum:disabled:placeholder-shown{background-image:none;border:1px solid transparent}.borders.svelte-7iawum:disabled:-moz-placeholder-shown:active{border:1px solid transparent;outline:none}.borders.svelte-7iawum:disabled:placeholder-shown:active{border:1px solid transparent;outline:none}.borders.svelte-7iawum:-moz-placeholder-shown{background-image:none;border:1px solid var(--black1)}.borders.svelte-7iawum:placeholder-shown{background-image:none;border:1px solid var(--black1)}.indent.svelte-7iawum{padding-left:32px}.invalid.svelte-7iawum,.invalid.svelte-7iawum:focus,.invalid.svelte-7iawum:hover{border:1px solid var(--red);outline:1px solid var(--red);outline-offset:-2px}.icon.svelte-7iawum{height:var(--size-medium);left:0;position:absolute;top:-1px;width:var(--size-medium);z-index:1}.error.svelte-7iawum{color:var(--red);font-size:var(--font-size-xsmall);font-weight:var(--font-weight-normal);letter-spacing:var( --font-letter-spacing-neg-xsmall);line-height:var(--line-height);padding-left:var(--size-xxsmall);padding-top:var(--size-xxxsmall)}";
    styleInject(css_248z$p);

    var css_248z$o = "div.svelte-5ogf37{align-items:center;color:var(--black3);cursor:default;display:flex;font-size:var(--font-size-xsmall);font-weight:var(--font-weight-normal);height:var(--size-medium);letter-spacing:var( --font-letter-spacing-pos-xsmall);line-height:var(--line-height);padding:0 calc(var(--size-xxsmall)/2) 0 var(--size-xxsmall);-webkit-user-select:none;-moz-user-select:none;user-select:none;width:100%}";
    styleInject(css_248z$o);

    var css_248z$n = ".onboarding-tip.svelte-889taf{align-items:top;display:flex;padding:0 var(--size-xsmall) 0 0}.icon.svelte-889taf{height:var(--size-medium);margin-right:var(--size-xxsmall);width:var(--size-medium)}p.svelte-889taf{color:var(--black8);font-size:var(--font-size-xsmall);font-weight:var(--font-weight-normal);letter-spacing:var( --font-letter-spacing-pos-xsmall);line-height:var(--line-height);margin:0;padding:var(--size-xxsmall) 0 var(--size-xxsmall) 0}";
    styleInject(css_248z$n);

    var css_248z$m = "div.svelte-1nb783l.svelte-1nb783l{align-items:center;cursor:default;display:flex;position:relative}input.svelte-1nb783l.svelte-1nb783l{flex-shrink:0;height:10px;margin:0;opacity:0;padding:0;width:10px}input.svelte-1nb783l:checked+label.svelte-1nb783l:before{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg width='6' height='6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='6' height='6' rx='3' fill='%23000' fill-opacity='.8'/%3E%3C/svg%3E\");background-position:2px 2px;background-repeat:no-repeat}input.svelte-1nb783l:disabled+label.svelte-1nb783l{opacity:.3}input.svelte-1nb783l:checked:disabled+label.svelte-1nb783l:before{border:1px solid var(--black)}label.svelte-1nb783l.svelte-1nb783l{color:var(--black8);display:flex;font-family:var(--font-stack);font-size:var(--font-size-xsmall);font-weight:var(--font-weight-normal);letter-spacing:var(--font-letter-spacing-pos-xsmall);line-height:var(--font-line-height);margin-left:-16px;padding:var(--size-xxsmall) var(--size-xsmall) var(--size-xxsmall) var(--size-small);-webkit-user-select:none;-moz-user-select:none;user-select:none}label.svelte-1nb783l.svelte-1nb783l:before{border:1px solid var(--black8);border-radius:var(--border-radius-small);border-radius:50%;content:\"\";display:block;flex-shrink:0;height:10px;margin:2px 10px 0 -8px;width:10px}input.svelte-1nb783l:enabled:checked:focus+label.svelte-1nb783l:before{border:1px solid var(--blue);border-radius:var(--border-radius-small);border-radius:50%;box-shadow:0 0 0 1px var(--blue)}input.svelte-1nb783l:enabled:focus+label.svelte-1nb783l:before{border:1px solid var(--blue);box-shadow:0 0 0 1px var(--blue)}";
    styleInject(css_248z$m);

    var css_248z$l = "div.svelte-12hz996{align-items:center;color:var(--black8);cursor:default;display:flex;font-size:var(--font-size-xsmall);font-weight:var(--font-weight-bold);height:var(--size-medium);letter-spacing:var( --font-letter-spacing-pos-xsmall);line-height:var(--line-height);padding:0 calc(var(--size-xxsmall)/2) 0 var(--size-xxsmall);-webkit-user-select:none;-moz-user-select:none;user-select:none;width:100%}";
    styleInject(css_248z$l);

    var css_248z$k = ".label.svelte-n9sx0h{align-items:center;color:var(--white4);display:flex;font-size:var(--font-size-small);font-weight:var(--font-weight-normal);height:var(--size-small);letter-spacing:var( --font-letter-spacing-neg-small);line-height:var(--line-height);margin-top:var(--size-xxsmall);padding:0 var(--size-xxsmall) 0 var(--size-medium)}.label.svelte-n9sx0h:first-child{border-top:none;margin-top:0}.divider.svelte-n9sx0h{background-color:var(--white2);display:block;height:1px;margin:8px 0 7px}";
    styleInject(css_248z$k);

    var css_248z$j = "li.svelte-1w32p1m{align-items:center;color:var(--white);cursor:default;display:flex;font-family:var(--font-stack);font-size:var(--font-size-small);font-weight:var(--font-weight-normal);height:var(--size-small);letter-spacing:var(--font-letter-spacing-neg-xsmall);line-height:var(--font-line-height);outline:none;padding:0 var(--size-xsmall) 0 var(--size-xxsmall);transition-duration:30ms;transition-property:background-color;-webkit-user-select:none;-moz-user-select:none;user-select:none}.label.svelte-1w32p1m{overflow-x:hidden;pointer-events:none;text-overflow:ellipsis;white-space:nowrap}.highlight.svelte-1w32p1m,li.svelte-1w32p1m:focus,li.svelte-1w32p1m:hover{background-color:var(--blue)}.icon.svelte-1w32p1m{background-image:url(\"data:image/svg+xml;utf8,%3Csvg%20fill%3D%22none%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%20width%3D%2216%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20clip-rule%3D%22evenodd%22%20d%3D%22m13.2069%205.20724-5.50002%205.49996-.70711.7072-.70711-.7072-3-2.99996%201.41422-1.41421%202.29289%202.29289%204.79293-4.79289z%22%20fill%3D%22%23fff%22%20fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E\");background-position:50%;background-repeat:no-repeat;height:var(--size-xsmall);margin-right:var(--size-xxsmall);opacity:0;pointer-events:none;width:var(--size-xsmall)}.icon.selected.svelte-1w32p1m{opacity:1}.blink.svelte-1w32p1m,.blink.svelte-1w32p1m:hover{background-color:transparent}";
    styleInject(css_248z$j);

    /* node_modules/svelte-click-outside/src/index.svelte generated by Svelte v3.48.0 */
    const file$h = "node_modules/svelte-click-outside/src/index.svelte";

    function create_fragment$h(ctx) {
    	let t;
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			t = space();
    			div = element("div");
    			if (default_slot) default_slot.c();
    			add_location(div, file$h, 31, 0, 549);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[5](div);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(document.body, "click", /*onClickOutside*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[5](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Src', slots, ['default']);
    	let { exclude = [] } = $$props;
    	let child;
    	const dispatch = createEventDispatcher();

    	function isExcluded(target) {
    		var parent = target;

    		while (parent) {
    			if (exclude.indexOf(parent) >= 0 || parent === child) {
    				return true;
    			}

    			parent = parent.parentNode;
    		}

    		return false;
    	}

    	function onClickOutside(event) {
    		if (!isExcluded(event.target)) {
    			dispatch('clickoutside');
    		}
    	}

    	const writable_props = ['exclude'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Src> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			child = $$value;
    			$$invalidate(0, child);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('exclude' in $$props) $$invalidate(2, exclude = $$props.exclude);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		exclude,
    		child,
    		dispatch,
    		isExcluded,
    		onClickOutside
    	});

    	$$self.$inject_state = $$props => {
    		if ('exclude' in $$props) $$invalidate(2, exclude = $$props.exclude);
    		if ('child' in $$props) $$invalidate(0, child = $$props.child);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [child, onClickOutside, exclude, $$scope, slots, div_binding];
    }

    class Src extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { exclude: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Src",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get exclude() {
    		throw new Error("<Src>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exclude(value) {
    		throw new Error("<Src>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$i = ".wrapper.svelte-1sefd75.svelte-1sefd75{position:relative}button.svelte-1sefd75.svelte-1sefd75{align-items:center;background-color:var(--white);border:1px solid transparent;border-radius:var(--border-radius-small);display:flex;height:30px;margin:1px 0;overflow-y:hidden;padding:0 var(--size-xxsmall) 0 var(--size-xxsmall);width:100%}button.svelte-1sefd75.svelte-1sefd75:hover{border-color:var(--black1)}button.svelte-1sefd75:hover .placeholder.svelte-1sefd75{color:var(--black8)}button.svelte-1sefd75:focus .caret svg path.svelte-1sefd75,button.svelte-1sefd75:hover .caret svg path.svelte-1sefd75{fill:var(--black8)}button.svelte-1sefd75:focus .caret.svelte-1sefd75,button.svelte-1sefd75:hover .caret.svelte-1sefd75{margin-left:auto}button.svelte-1sefd75.svelte-1sefd75:focus{border:1px solid var(--blue);outline:1px solid var(--blue);outline-offset:-2px}button.svelte-1sefd75:focus .placeholder.svelte-1sefd75{color:var(--black8)}button.svelte-1sefd75:disabled .label.svelte-1sefd75{color:var(--black3)}button.svelte-1sefd75.svelte-1sefd75:disabled:hover{border-color:transparent;justify-content:flex-start}button.svelte-1sefd75:disabled:hover .placeholder.svelte-1sefd75{color:var(--black3)}button.svelte-1sefd75:disabled:hover .caret svg path.svelte-1sefd75{fill:var(--black3)}button.svelte-1sefd75 .svelte-1sefd75{pointer-events:none}.label.svelte-1sefd75.svelte-1sefd75,.placeholder.svelte-1sefd75.svelte-1sefd75{color:var(--black8);font-size:var(--font-size-xsmall);font-weight:var(--font-weight-normal);letter-spacing:var( --font-letter-spacing-neg-xsmall);line-height:var(--line-height);margin-right:6px;margin-top:-3px;overflow-x:hidden;text-overflow:ellipsis;white-space:nowrap}.placeholder.svelte-1sefd75.svelte-1sefd75{color:var(--black3)}.caret.svelte-1sefd75.svelte-1sefd75{display:block;margin-top:-1px}.caret.svelte-1sefd75 svg path.svelte-1sefd75{fill:var(--black3)}.icon.svelte-1sefd75.svelte-1sefd75{margin-left:-8px;margin-right:0;margin-top:-2px}.menu.svelte-1sefd75.svelte-1sefd75{background-color:var(--hud);border-radius:var(--border-radius-small);box-shadow:var(--shadow-hud);left:0;margin:0;overflow-x:overlay;overflow-y:auto;padding:var(--size-xxsmall) 0 var(--size-xxsmall) 0;position:absolute;top:32px;width:100%;z-index:50}.menu.svelte-1sefd75.svelte-1sefd75::-webkit-scrollbar{background-color:transparent;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=);background-repeat:repeat;background-size:100% auto;width:12px}.menu.svelte-1sefd75.svelte-1sefd75::-webkit-scrollbar-track{border:3px solid transparent;box-shadow:inset 0 0 10px 10px transparent}.menu.svelte-1sefd75.svelte-1sefd75::-webkit-scrollbar-thumb{border:3px solid transparent;border-radius:6px;box-shadow:inset 0 0 10px 10px hsla(0,0%,100%,.4)}";
    styleInject(css_248z$i);

    var css_248z$h = "div.svelte-1eflzw2.svelte-1eflzw2{align-items:center;cursor:default;display:flex;position:relative}input.svelte-1eflzw2.svelte-1eflzw2{opacity:0}input.svelte-1eflzw2:checked+label.svelte-1eflzw2:before{background-color:var(--black8-opaque);color:var(--black8)}input.svelte-1eflzw2:checked+label.svelte-1eflzw2:after{transform:translateX(12px)}input.svelte-1eflzw2:disabled+label.svelte-1eflzw2{color:var(--black);opacity:.3}input.svelte-1eflzw2:checked:disabled+label.svelte-1eflzw2:before{background-color:var(--black);border:1px solid var(--black)}input.svelte-1eflzw2:focus+label.svelte-1eflzw2:before{box-shadow:0 0 0 2px var(--blue)}label.svelte-1eflzw2.svelte-1eflzw2{color:var(--black8);display:flex;font-family:var(--font-stack);font-size:var(--font-size-xsmall);font-weight:var(--font-weight-normal);letter-spacing:var(--font-letter-spacing-pos-xsmall);line-height:var(--font-line-height);margin-left:-16px;padding:var(--size-xxsmall) var(--size-xsmall) var(--size-xxsmall) calc(var(--size-xlarge) - 2px);-webkit-user-select:none;-moz-user-select:none;user-select:none}label.svelte-1eflzw2.svelte-1eflzw2:before{border:1px solid var(--black8-opaque);border-radius:6px;transition:background-color .2s .1s;width:22px}label.svelte-1eflzw2.svelte-1eflzw2:after,label.svelte-1eflzw2.svelte-1eflzw2:before{background-color:var(--white);content:\"\";display:block;height:10px;left:8px;position:absolute;top:10px}label.svelte-1eflzw2.svelte-1eflzw2:after{border:1px solid var(--black8-opaque);border-radius:50%;transition:transform .2s;width:10px}";
    styleInject(css_248z$h);

    var css_248z$g = ".textarea.svelte-wmwga5{position:relative}textarea.svelte-wmwga5{align-items:center;background-color:var(--white);border:1px solid var(--black1);border-radius:var(--border-radius-small);color:var(--black8);display:flex;font-family:var(--font-stack);font-size:var(--font-size-xsmall);font-weight:var(--font-weight-normal);letter-spacing:var( --font-letter-spacing-neg-xsmall);line-height:var(--line-height);margin:1px 0;min-height:62px;outline:none;overflow:visible;overflow-y:auto;padding:7px 4px 9px 7px;position:relative;resize:none;width:100%}textarea.svelte-wmwga5:-moz-placeholder-shown:hover{background-image:none;border:1px solid var(--black1);color:var(--black8)}textarea.svelte-wmwga5:hover,textarea.svelte-wmwga5:placeholder-shown:hover{background-image:none;border:1px solid var(--black1);color:var(--black8)}textarea.svelte-wmwga5::-moz-selection{background-color:var(--blue3);color:var(--black)}textarea.svelte-wmwga5::selection{background-color:var(--blue3);color:var(--black)}textarea.svelte-wmwga5::-moz-placeholder{border:1px solid transparent;color:var(--black3)}textarea.svelte-wmwga5::placeholder{border:1px solid transparent;color:var(--black3)}textarea.svelte-wmwga5:focus:-moz-placeholder-shown{border:1px solid var(--blue);outline:1px solid var(--blue);outline-offset:-2px}textarea.svelte-wmwga5:focus:placeholder-shown{border:1px solid var(--blue);outline:1px solid var(--blue);outline-offset:-2px}textarea.svelte-wmwga5:active,textarea.svelte-wmwga5:focus{border:1px solid var(--blue);color:var(--black);outline:1px solid var(--blue);outline-offset:-2px;padding:7px 4px 9px 7px}textarea.svelte-wmwga5:disabled,textarea.svelte-wmwga5:disabled:hover{border:1px solid transparent;color:var(--black3);position:relative}textarea.svelte-wmwga5:disabled:active{outline:none;padding:7px 4px 9px 7px}";
    styleInject(css_248z$g);

    var css_248z$f = ".type.svelte-eq54v9{font-family:var(--font-stack);font-size:var(--font-size-xsmall);font-weight:var(--font-weight-normal);letter-spacing:var(--font-letter-spacing-pos-xsmall);line-height:var(--font-line-height)}.small.svelte-eq54v9{font-size:var(--font-size-small);letter-spacing:var(--font-letter-spacing-pos-small)}.large.svelte-eq54v9{font-size:var(--font-size-large);letter-spacing:var(--font-letter-spacing-pos-large);line-height:var(--font-line-height-large)}.xlarge.svelte-eq54v9{font-size:var(--font-size-xlarge);letter-spacing:var(--font-letter-spacing-pos-xlarge);line-height:var(--font-line-height-large)}.medium.svelte-eq54v9{font-weight:var(--font-weight-medium)}.bold.svelte-eq54v9{font-weight:var(--font-weight-bold)}.inverse.svelte-eq54v9{letter-spacing:var(--font-letter-spacing-neg-xsmall)}.inverse.small.svelte-eq54v9{letter-spacing:var(--font-letter-spacing-neg-small)}.inverse.large.svelte-eq54v9{letter-spacing:var(--font-letter-spacing-neg-large)}.inverse.xlarge.svelte-eq54v9{letter-spacing:var(--font-letter-spacing-neg-xlarge)}.inline.svelte-eq54v9{display:inline-block}";
    styleInject(css_248z$f);

    var IconWarning = "<svg fill=\"none\" height=\"32\" viewBox=\"0 0 32 32\" width=\"32\" xmlns=\"http://www.w3.org/2000/svg\"><path clip-rule=\"evenodd\" d=\"m16 9 8 14h-16zm-1 8.5v-3.5h2v3.5zm0 1.5v2h2v-2z\" fill=\"#000\" fill-rule=\"evenodd\"/></svg>";

    var css_248z$e = ".error-message.svelte-i9y5oq{align-items:center;background:red;border-radius:3px;bottom:32px;box-shadow:0 0 13.5155px rgba(0,0,0,.05);color:#fff;display:flex;flex-direction:row;font-size:12px;font-weight:500;left:50%;padding:4px 16px 4px 8px;position:fixed;transform:translate(-50%);z-index:99}";
    styleInject(css_248z$e);

    /* src/lib/components/ErrorMessage.svelte generated by Svelte v3.48.0 */
    const file$g = "src/lib/components/ErrorMessage.svelte";

    function create_fragment$g(ctx) {
    	let div;
    	let icon;
    	let t0;
    	let t1;
    	let div_transition;
    	let current;

    	icon = new Icon({
    			props: { iconName: IconWarning, color: "red" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(icon.$$.fragment);
    			t0 = space();
    			t1 = text(/*errorMessage*/ ctx[0]);
    			attr_dev(div, "class", "error-message svelte-i9y5oq");
    			add_location(div, file$g, 7, 0, 154);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(icon, div, null);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*errorMessage*/ 1) set_data_dev(t1, /*errorMessage*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(icon);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ErrorMessage', slots, []);
    	let { errorMessage } = $$props;
    	const writable_props = ['errorMessage'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ErrorMessage> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('errorMessage' in $$props) $$invalidate(0, errorMessage = $$props.errorMessage);
    	};

    	$$self.$capture_state = () => ({ fade, Icon, IconWarning, errorMessage });

    	$$self.$inject_state = $$props => {
    		if ('errorMessage' in $$props) $$invalidate(0, errorMessage = $$props.errorMessage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [errorMessage];
    }

    class ErrorMessage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { errorMessage: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ErrorMessage",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*errorMessage*/ ctx[0] === undefined && !('errorMessage' in props)) {
    			console.warn("<ErrorMessage> was created without expected prop 'errorMessage'");
    		}
    	}

    	get errorMessage() {
    		throw new Error("<ErrorMessage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errorMessage(value) {
    		throw new Error("<ErrorMessage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$d = ".menu-pane.svelte-1ildpv6{background-color:var(--figma-color-bg);border:1px solid var(--figma-color-border);border-radius:8px;bottom:52px;display:flex;flex-direction:column;position:fixed;right:8px}.menu-row.svelte-1ildpv6{align-items:center;color:var(--figma-color-text);display:flex;font-size:14px;padding:8px}.menu-row.svelte-1ildpv6:hover{color:var(--figma-color-text-secondary)}";
    styleInject(css_248z$d);

    /* src/lib/components/Menu.svelte generated by Svelte v3.48.0 */
    const file$f = "src/lib/components/Menu.svelte";

    function create_fragment$f(ctx) {
    	let div2;
    	let a0;
    	let div0;
    	let i0;
    	let t0;
    	let t1;
    	let a1;
    	let div1;
    	let i1;
    	let t2;
    	let div2_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			a0 = element("a");
    			div0 = element("div");
    			i0 = element("i");
    			t0 = text("\n      About");
    			t1 = space();
    			a1 = element("a");
    			div1 = element("div");
    			i1 = element("i");
    			t2 = text("\n      Report Issue");
    			attr_dev(i0, "class", "mr-2 text-xs fa-sharp fa-solid fa-location-question");
    			add_location(i0, file$f, 7, 6, 211);
    			attr_dev(div0, "class", "menu-row svelte-1ildpv6");
    			add_location(div0, file$f, 6, 4, 182);
    			attr_dev(a0, "href", "https://github.com/the-dataface/figma2html");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$f, 5, 2, 108);
    			attr_dev(i1, "class", "mr-2 text-xs fa-sharp fa-solid fa-triangle-exclamation");
    			add_location(i1, file$f, 13, 6, 419);
    			attr_dev(div1, "class", "menu-row svelte-1ildpv6");
    			add_location(div1, file$f, 12, 4, 390);
    			attr_dev(a1, "href", "https://github.com/the-dataface/figma2html/issues");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$f, 11, 2, 309);
    			attr_dev(div2, "class", "menu-pane svelte-1ildpv6");
    			add_location(div2, file$f, 4, 0, 65);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, a0);
    			append_dev(a0, div0);
    			append_dev(div0, i0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, a1);
    			append_dev(a1, div1);
    			append_dev(div1, i1);
    			append_dev(div1, t2);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, slide, {}, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching && div2_transition) div2_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ slide });
    	return [];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    var css_248z$c = ".footer.svelte-1ce0z4j.svelte-1ce0z4j{background:var(--figma-color-bg);border-top:1px solid var(--figma-color-border)}.footer.svelte-1ce0z4j button.svelte-1ce0z4j{align-items:center;background:none;border:none;border-radius:0;color:var(--figma-color-text);cursor:pointer;display:flex;flex-wrap:none;height:100%;padding:0}.footer.svelte-1ce0z4j button.svelte-1ce0z4j:hover{opacity:.8}.footer.svelte-1ce0z4j button.primary.svelte-1ce0z4j{background:var(--figma-color-bg-success);color:var(--figma-color-bg);font-weight:700;padding:8px 16px}.figma-dark .footer button.primary{color:var(--figma-color-text)!important}.footer.svelte-1ce0z4j button.primary.svelte-1ce0z4j:disabled{background:var(--figma-color-bg-secondary)!important;cursor:not-allowed}.footer.svelte-1ce0z4j button.secondary.svelte-1ce0z4j{color:var(--figma-color-text-secondary);font-size:11px}.footer.svelte-1ce0z4j button.secondary p.svelte-1ce0z4j{margin-left:-4px}.footer.svelte-1ce0z4j button.secondary.svelte-1ce0z4j:hover{opacity:.8}.footer.svelte-1ce0z4j button.ellipses.svelte-1ce0z4j{border-left:1px solid var(--figma-color-border);padding:8px}";
    styleInject(css_248z$c);

    /* src/lib/components/Footer.svelte generated by Svelte v3.48.0 */
    const file$e = "src/lib/components/Footer.svelte";

    // (25:4) <HoverIcon text={true} on:click={onReset}>
    function create_default_slot_2$2(ctx) {
    	let button;
    	let i;
    	let t0;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			i = element("i");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Reset to defaults";
    			attr_dev(i, "class", "mr-2 fa-sharp fa-solid fa-rotate");
    			add_location(i, file$e, 26, 8, 871);
    			attr_dev(p, "class", "m-0 svelte-1ce0z4j");
    			add_location(p, file$e, 27, 8, 926);
    			attr_dev(button, "class", "secondary svelte-1ce0z4j");
    			add_location(button, file$e, 25, 6, 817);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, i);
    			append_dev(button, t0);
    			append_dev(button, p);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*onReset*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$2.name,
    		type: "slot",
    		source: "(25:4) <HoverIcon text={true} on:click={onReset}>",
    		ctx
    	});

    	return block;
    }

    // (32:4) <HoverIcon text={true} on:click={onSave}>
    function create_default_slot_1$2(ctx) {
    	let button;
    	let i;
    	let t0;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			i = element("i");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Save settings";
    			attr_dev(i, "class", "mr-2 fa-sharp fa-solid fa-floppy-disk");
    			add_location(i, file$e, 33, 8, 1102);
    			attr_dev(p, "class", "m-0 svelte-1ce0z4j");
    			add_location(p, file$e, 34, 8, 1162);
    			attr_dev(button, "class", "secondary svelte-1ce0z4j");
    			add_location(button, file$e, 32, 6, 1049);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, i);
    			append_dev(button, t0);
    			append_dev(button, p);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*onSave*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(32:4) <HoverIcon text={true} on:click={onSave}>",
    		ctx
    	});

    	return block;
    }

    // (39:4) <HoverIcon text={true} on:click={onLoad}>
    function create_default_slot$3(ctx) {
    	let button;
    	let i;
    	let t0;
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			i = element("i");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Load settings";
    			attr_dev(i, "class", "mr-2 fa-sharp fa-solid fa-file-import");
    			add_location(i, file$e, 40, 8, 1334);
    			attr_dev(p, "class", "m-0 svelte-1ce0z4j");
    			add_location(p, file$e, 41, 8, 1394);
    			attr_dev(button, "class", "secondary svelte-1ce0z4j");
    			add_location(button, file$e, 39, 6, 1281);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, i);
    			append_dev(button, t0);
    			append_dev(button, p);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*onLoad*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(39:4) <HoverIcon text={true} on:click={onLoad}>",
    		ctx
    	});

    	return block;
    }

    // (51:0) {#if menuOpen}
    function create_if_block$8(ctx) {
    	let menu;
    	let current;
    	menu = new Menu({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(menu.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(menu, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menu.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menu.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(menu, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(51:0) {#if menuOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div1;
    	let div0;
    	let button0;
    	let t0;
    	let t1_value = (/*nodeCount*/ ctx[0] > 0 ? /*nodeCount*/ ctx[0] + 1 : 0) + "";
    	let t1;
    	let t2;
    	let button0_disabled_value;
    	let t3;
    	let hovericon0;
    	let t4;
    	let hovericon1;
    	let t5;
    	let hovericon2;
    	let t6;
    	let button1;
    	let i;
    	let t7;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	hovericon0 = new HoverIcon({
    			props: {
    				text: true,
    				$$slots: { default: [create_default_slot_2$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	hovericon0.$on("click", /*onReset*/ ctx[6]);

    	hovericon1 = new HoverIcon({
    			props: {
    				text: true,
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	hovericon1.$on("click", /*onSave*/ ctx[4]);

    	hovericon2 = new HoverIcon({
    			props: {
    				text: true,
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	hovericon2.$on("click", /*onLoad*/ ctx[5]);
    	let if_block = /*menuOpen*/ ctx[1] && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			t0 = text("Export ");
    			t1 = text(t1_value);
    			t2 = text(" assets");
    			t3 = space();
    			create_component(hovericon0.$$.fragment);
    			t4 = space();
    			create_component(hovericon1.$$.fragment);
    			t5 = space();
    			create_component(hovericon2.$$.fragment);
    			t6 = space();
    			button1 = element("button");
    			i = element("i");
    			t7 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(button0, "class", "primary svelte-1ce0z4j");
    			button0.disabled = button0_disabled_value = /*nodeCount*/ ctx[0] === 0;
    			add_location(button0, file$e, 22, 4, 629);
    			attr_dev(div0, "class", "h-full flex items-center gap-2");
    			add_location(div0, file$e, 21, 2, 580);
    			attr_dev(i, "class", "mx-2 fa-sharp fa-solid fa-ellipsis");
    			add_location(i, file$e, 46, 4, 1525);
    			attr_dev(button1, "class", "ellipses svelte-1ce0z4j");
    			add_location(button1, file$e, 45, 2, 1471);
    			attr_dev(div1, "class", "footer fixed bottom-0 left-0 w-full h-12 flex justify-between items-center z-20 svelte-1ce0z4j");
    			add_location(div1, file$e, 20, 0, 484);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(button0, t0);
    			append_dev(button0, t1);
    			append_dev(button0, t2);
    			append_dev(div0, t3);
    			mount_component(hovericon0, div0, null);
    			append_dev(div0, t4);
    			mount_component(hovericon1, div0, null);
    			append_dev(div0, t5);
    			mount_component(hovericon2, div0, null);
    			append_dev(div1, t6);
    			append_dev(div1, button1);
    			append_dev(button1, i);
    			insert_dev(target, t7, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*onExport*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*onToggleMenu*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*nodeCount*/ 1) && t1_value !== (t1_value = (/*nodeCount*/ ctx[0] > 0 ? /*nodeCount*/ ctx[0] + 1 : 0) + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*nodeCount*/ 1 && button0_disabled_value !== (button0_disabled_value = /*nodeCount*/ ctx[0] === 0)) {
    				prop_dev(button0, "disabled", button0_disabled_value);
    			}

    			const hovericon0_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				hovericon0_changes.$$scope = { dirty, ctx };
    			}

    			hovericon0.$set(hovericon0_changes);
    			const hovericon1_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				hovericon1_changes.$$scope = { dirty, ctx };
    			}

    			hovericon1.$set(hovericon1_changes);
    			const hovericon2_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				hovericon2_changes.$$scope = { dirty, ctx };
    			}

    			hovericon2.$set(hovericon2_changes);

    			if (/*menuOpen*/ ctx[1]) {
    				if (if_block) {
    					if (dirty & /*menuOpen*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hovericon0.$$.fragment, local);
    			transition_in(hovericon1.$$.fragment, local);
    			transition_in(hovericon2.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hovericon0.$$.fragment, local);
    			transition_out(hovericon1.$$.fragment, local);
    			transition_out(hovericon2.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(hovericon0);
    			destroy_component(hovericon1);
    			destroy_component(hovericon2);
    			if (detaching) detach_dev(t7);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	let { nodeCount = 0 } = $$props;
    	const dispatch = createEventDispatcher();
    	let menuOpen = false;
    	const onToggleMenu = () => $$invalidate(1, menuOpen = !menuOpen);
    	const onExport = () => dispatch("export");
    	const onSave = () => dispatch("save");
    	const onLoad = () => dispatch("load");
    	const onReset = () => dispatch("reset");
    	const writable_props = ['nodeCount'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('nodeCount' in $$props) $$invalidate(0, nodeCount = $$props.nodeCount);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Menu,
    		HoverIcon,
    		nodeCount,
    		dispatch,
    		menuOpen,
    		onToggleMenu,
    		onExport,
    		onSave,
    		onLoad,
    		onReset
    	});

    	$$self.$inject_state = $$props => {
    		if ('nodeCount' in $$props) $$invalidate(0, nodeCount = $$props.nodeCount);
    		if ('menuOpen' in $$props) $$invalidate(1, menuOpen = $$props.menuOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [nodeCount, menuOpen, onToggleMenu, onExport, onSave, onLoad, onReset];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { nodeCount: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get nodeCount() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nodeCount(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var slugify$1 = {exports: {}};

    (function (module, exports) {
    (function (name, root, factory) {
    	  {
    	    module.exports = factory();
    	    module.exports['default'] = factory();
    	  }
    	}('slugify', commonjsGlobal, function () {
    	  var charMap = JSON.parse('{"$":"dollar","%":"percent","&":"and","<":"less",">":"greater","|":"or","¢":"cent","£":"pound","¤":"currency","¥":"yen","©":"(c)","ª":"a","®":"(r)","º":"o","À":"A","Á":"A","Â":"A","Ã":"A","Ä":"A","Å":"A","Æ":"AE","Ç":"C","È":"E","É":"E","Ê":"E","Ë":"E","Ì":"I","Í":"I","Î":"I","Ï":"I","Ð":"D","Ñ":"N","Ò":"O","Ó":"O","Ô":"O","Õ":"O","Ö":"O","Ø":"O","Ù":"U","Ú":"U","Û":"U","Ü":"U","Ý":"Y","Þ":"TH","ß":"ss","à":"a","á":"a","â":"a","ã":"a","ä":"a","å":"a","æ":"ae","ç":"c","è":"e","é":"e","ê":"e","ë":"e","ì":"i","í":"i","î":"i","ï":"i","ð":"d","ñ":"n","ò":"o","ó":"o","ô":"o","õ":"o","ö":"o","ø":"o","ù":"u","ú":"u","û":"u","ü":"u","ý":"y","þ":"th","ÿ":"y","Ā":"A","ā":"a","Ă":"A","ă":"a","Ą":"A","ą":"a","Ć":"C","ć":"c","Č":"C","č":"c","Ď":"D","ď":"d","Đ":"DJ","đ":"dj","Ē":"E","ē":"e","Ė":"E","ė":"e","Ę":"e","ę":"e","Ě":"E","ě":"e","Ğ":"G","ğ":"g","Ģ":"G","ģ":"g","Ĩ":"I","ĩ":"i","Ī":"i","ī":"i","Į":"I","į":"i","İ":"I","ı":"i","Ķ":"k","ķ":"k","Ļ":"L","ļ":"l","Ľ":"L","ľ":"l","Ł":"L","ł":"l","Ń":"N","ń":"n","Ņ":"N","ņ":"n","Ň":"N","ň":"n","Ō":"O","ō":"o","Ő":"O","ő":"o","Œ":"OE","œ":"oe","Ŕ":"R","ŕ":"r","Ř":"R","ř":"r","Ś":"S","ś":"s","Ş":"S","ş":"s","Š":"S","š":"s","Ţ":"T","ţ":"t","Ť":"T","ť":"t","Ũ":"U","ũ":"u","Ū":"u","ū":"u","Ů":"U","ů":"u","Ű":"U","ű":"u","Ų":"U","ų":"u","Ŵ":"W","ŵ":"w","Ŷ":"Y","ŷ":"y","Ÿ":"Y","Ź":"Z","ź":"z","Ż":"Z","ż":"z","Ž":"Z","ž":"z","Ə":"E","ƒ":"f","Ơ":"O","ơ":"o","Ư":"U","ư":"u","ǈ":"LJ","ǉ":"lj","ǋ":"NJ","ǌ":"nj","Ș":"S","ș":"s","Ț":"T","ț":"t","ə":"e","˚":"o","Ά":"A","Έ":"E","Ή":"H","Ί":"I","Ό":"O","Ύ":"Y","Ώ":"W","ΐ":"i","Α":"A","Β":"B","Γ":"G","Δ":"D","Ε":"E","Ζ":"Z","Η":"H","Θ":"8","Ι":"I","Κ":"K","Λ":"L","Μ":"M","Ν":"N","Ξ":"3","Ο":"O","Π":"P","Ρ":"R","Σ":"S","Τ":"T","Υ":"Y","Φ":"F","Χ":"X","Ψ":"PS","Ω":"W","Ϊ":"I","Ϋ":"Y","ά":"a","έ":"e","ή":"h","ί":"i","ΰ":"y","α":"a","β":"b","γ":"g","δ":"d","ε":"e","ζ":"z","η":"h","θ":"8","ι":"i","κ":"k","λ":"l","μ":"m","ν":"n","ξ":"3","ο":"o","π":"p","ρ":"r","ς":"s","σ":"s","τ":"t","υ":"y","φ":"f","χ":"x","ψ":"ps","ω":"w","ϊ":"i","ϋ":"y","ό":"o","ύ":"y","ώ":"w","Ё":"Yo","Ђ":"DJ","Є":"Ye","І":"I","Ї":"Yi","Ј":"J","Љ":"LJ","Њ":"NJ","Ћ":"C","Џ":"DZ","А":"A","Б":"B","В":"V","Г":"G","Д":"D","Е":"E","Ж":"Zh","З":"Z","И":"I","Й":"J","К":"K","Л":"L","М":"M","Н":"N","О":"O","П":"P","Р":"R","С":"S","Т":"T","У":"U","Ф":"F","Х":"H","Ц":"C","Ч":"Ch","Ш":"Sh","Щ":"Sh","Ъ":"U","Ы":"Y","Ь":"","Э":"E","Ю":"Yu","Я":"Ya","а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ж":"zh","з":"z","и":"i","й":"j","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"c","ч":"ch","ш":"sh","щ":"sh","ъ":"u","ы":"y","ь":"","э":"e","ю":"yu","я":"ya","ё":"yo","ђ":"dj","є":"ye","і":"i","ї":"yi","ј":"j","љ":"lj","њ":"nj","ћ":"c","ѝ":"u","џ":"dz","Ґ":"G","ґ":"g","Ғ":"GH","ғ":"gh","Қ":"KH","қ":"kh","Ң":"NG","ң":"ng","Ү":"UE","ү":"ue","Ұ":"U","ұ":"u","Һ":"H","һ":"h","Ә":"AE","ә":"ae","Ө":"OE","ө":"oe","Ա":"A","Բ":"B","Գ":"G","Դ":"D","Ե":"E","Զ":"Z","Է":"E\'","Ը":"Y\'","Թ":"T\'","Ժ":"JH","Ի":"I","Լ":"L","Խ":"X","Ծ":"C\'","Կ":"K","Հ":"H","Ձ":"D\'","Ղ":"GH","Ճ":"TW","Մ":"M","Յ":"Y","Ն":"N","Շ":"SH","Չ":"CH","Պ":"P","Ջ":"J","Ռ":"R\'","Ս":"S","Վ":"V","Տ":"T","Ր":"R","Ց":"C","Փ":"P\'","Ք":"Q\'","Օ":"O\'\'","Ֆ":"F","և":"EV","ء":"a","آ":"aa","أ":"a","ؤ":"u","إ":"i","ئ":"e","ا":"a","ب":"b","ة":"h","ت":"t","ث":"th","ج":"j","ح":"h","خ":"kh","د":"d","ذ":"th","ر":"r","ز":"z","س":"s","ش":"sh","ص":"s","ض":"dh","ط":"t","ظ":"z","ع":"a","غ":"gh","ف":"f","ق":"q","ك":"k","ل":"l","م":"m","ن":"n","ه":"h","و":"w","ى":"a","ي":"y","ً":"an","ٌ":"on","ٍ":"en","َ":"a","ُ":"u","ِ":"e","ْ":"","٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9","پ":"p","چ":"ch","ژ":"zh","ک":"k","گ":"g","ی":"y","۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9","฿":"baht","ა":"a","ბ":"b","გ":"g","დ":"d","ე":"e","ვ":"v","ზ":"z","თ":"t","ი":"i","კ":"k","ლ":"l","მ":"m","ნ":"n","ო":"o","პ":"p","ჟ":"zh","რ":"r","ს":"s","ტ":"t","უ":"u","ფ":"f","ქ":"k","ღ":"gh","ყ":"q","შ":"sh","ჩ":"ch","ც":"ts","ძ":"dz","წ":"ts","ჭ":"ch","ხ":"kh","ჯ":"j","ჰ":"h","Ṣ":"S","ṣ":"s","Ẁ":"W","ẁ":"w","Ẃ":"W","ẃ":"w","Ẅ":"W","ẅ":"w","ẞ":"SS","Ạ":"A","ạ":"a","Ả":"A","ả":"a","Ấ":"A","ấ":"a","Ầ":"A","ầ":"a","Ẩ":"A","ẩ":"a","Ẫ":"A","ẫ":"a","Ậ":"A","ậ":"a","Ắ":"A","ắ":"a","Ằ":"A","ằ":"a","Ẳ":"A","ẳ":"a","Ẵ":"A","ẵ":"a","Ặ":"A","ặ":"a","Ẹ":"E","ẹ":"e","Ẻ":"E","ẻ":"e","Ẽ":"E","ẽ":"e","Ế":"E","ế":"e","Ề":"E","ề":"e","Ể":"E","ể":"e","Ễ":"E","ễ":"e","Ệ":"E","ệ":"e","Ỉ":"I","ỉ":"i","Ị":"I","ị":"i","Ọ":"O","ọ":"o","Ỏ":"O","ỏ":"o","Ố":"O","ố":"o","Ồ":"O","ồ":"o","Ổ":"O","ổ":"o","Ỗ":"O","ỗ":"o","Ộ":"O","ộ":"o","Ớ":"O","ớ":"o","Ờ":"O","ờ":"o","Ở":"O","ở":"o","Ỡ":"O","ỡ":"o","Ợ":"O","ợ":"o","Ụ":"U","ụ":"u","Ủ":"U","ủ":"u","Ứ":"U","ứ":"u","Ừ":"U","ừ":"u","Ử":"U","ử":"u","Ữ":"U","ữ":"u","Ự":"U","ự":"u","Ỳ":"Y","ỳ":"y","Ỵ":"Y","ỵ":"y","Ỷ":"Y","ỷ":"y","Ỹ":"Y","ỹ":"y","–":"-","‘":"\'","’":"\'","“":"\\\"","”":"\\\"","„":"\\\"","†":"+","•":"*","…":"...","₠":"ecu","₢":"cruzeiro","₣":"french franc","₤":"lira","₥":"mill","₦":"naira","₧":"peseta","₨":"rupee","₩":"won","₪":"new shequel","₫":"dong","€":"euro","₭":"kip","₮":"tugrik","₯":"drachma","₰":"penny","₱":"peso","₲":"guarani","₳":"austral","₴":"hryvnia","₵":"cedi","₸":"kazakhstani tenge","₹":"indian rupee","₺":"turkish lira","₽":"russian ruble","₿":"bitcoin","℠":"sm","™":"tm","∂":"d","∆":"delta","∑":"sum","∞":"infinity","♥":"love","元":"yuan","円":"yen","﷼":"rial","ﻵ":"laa","ﻷ":"laa","ﻹ":"lai","ﻻ":"la"}');
    	  var locales = JSON.parse('{"bg":{"Й":"Y","Ц":"Ts","Щ":"Sht","Ъ":"A","Ь":"Y","й":"y","ц":"ts","щ":"sht","ъ":"a","ь":"y"},"de":{"Ä":"AE","ä":"ae","Ö":"OE","ö":"oe","Ü":"UE","ü":"ue","ß":"ss","%":"prozent","&":"und","|":"oder","∑":"summe","∞":"unendlich","♥":"liebe"},"es":{"%":"por ciento","&":"y","<":"menor que",">":"mayor que","|":"o","¢":"centavos","£":"libras","¤":"moneda","₣":"francos","∑":"suma","∞":"infinito","♥":"amor"},"fr":{"%":"pourcent","&":"et","<":"plus petit",">":"plus grand","|":"ou","¢":"centime","£":"livre","¤":"devise","₣":"franc","∑":"somme","∞":"infini","♥":"amour"},"pt":{"%":"porcento","&":"e","<":"menor",">":"maior","|":"ou","¢":"centavo","∑":"soma","£":"libra","∞":"infinito","♥":"amor"},"uk":{"И":"Y","и":"y","Й":"Y","й":"y","Ц":"Ts","ц":"ts","Х":"Kh","х":"kh","Щ":"Shch","щ":"shch","Г":"H","г":"h"},"vi":{"Đ":"D","đ":"d"},"da":{"Ø":"OE","ø":"oe","Å":"AA","å":"aa","%":"procent","&":"og","|":"eller","$":"dollar","<":"mindre end",">":"større end"},"nb":{"&":"og","Å":"AA","Æ":"AE","Ø":"OE","å":"aa","æ":"ae","ø":"oe"},"it":{"&":"e"},"nl":{"&":"en"},"sv":{"&":"och","Å":"AA","Ä":"AE","Ö":"OE","å":"aa","ä":"ae","ö":"oe"}}');

    	  function replace (string, options) {
    	    if (typeof string !== 'string') {
    	      throw new Error('slugify: string argument expected')
    	    }

    	    options = (typeof options === 'string')
    	      ? {replacement: options}
    	      : options || {};

    	    var locale = locales[options.locale] || {};

    	    var replacement = options.replacement === undefined ? '-' : options.replacement;

    	    var trim = options.trim === undefined ? true : options.trim;

    	    var slug = string.normalize().split('')
    	      // replace characters based on charMap
    	      .reduce(function (result, ch) {
    	        var appendChar = locale[ch] || charMap[ch] || ch;
    	        if (appendChar === replacement) {
    	          appendChar = ' ';
    	        }
    	        return result + appendChar
    	          // remove not allowed characters
    	          .replace(options.remove || /[^\w\s$*_+~.()'"!\-:@]+/g, '')
    	      }, '');

    	    if (options.strict) {
    	      slug = slug.replace(/[^A-Za-z0-9\s]/g, '');
    	    }

    	    if (trim) {
    	      slug = slug.trim();
    	    }

    	    // Replace spaces with replacement character, treating multiple consecutive
    	    // spaces as a single space.
    	    slug = slug.replace(/\s+/g, replacement);

    	    if (options.lower) {
    	      slug = slug.toLowerCase();
    	    }

    	    return slug
    	  }

    	  replace.extend = function (customMap) {
    	    Object.assign(charMap, customMap);
    	  };

    	  return replace
    	}));
    } (slugify$1));

    var slugify = slugify$1.exports;

    var css_248z$b = "input.svelte-1tw5jsl.svelte-1tw5jsl{cursor:pointer;opacity:0;position:absolute}.checkmark.svelte-1tw5jsl.svelte-1tw5jsl{background-color:var(--figma-color-bg);border:1px solid var(--figma-color-border)}.container.svelte-1tw5jsl:hover .checkmark.svelte-1tw5jsl{border:1px solid var(--figma-color-border-strong)}.checkmark.checked.svelte-1tw5jsl.svelte-1tw5jsl{background-color:var(--figma-color-bg-success)}";
    styleInject(css_248z$b);

    /* src/lib/components/Inputs/Checkbox.svelte generated by Svelte v3.48.0 */
    const file$d = "src/lib/components/Inputs/Checkbox.svelte";

    // (33:8) {#if checked}
    function create_if_block$7(ctx) {
    	let i;
    	let i_transition;
    	let current;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "fas fa-check text-xs");
    			add_location(i, file$d, 33, 12, 901);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!i_transition) i_transition = create_bidirectional_transition(i, fade, {}, true);
    				i_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!i_transition) i_transition = create_bidirectional_transition(i, fade, {}, false);
    			i_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching && i_transition) i_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(33:8) {#if checked}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div1;
    	let input;
    	let t0;
    	let div0;
    	let t1;
    	let label_1;
    	let h5;
    	let t2;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*checked*/ ctx[0] && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			input = element("input");
    			t0 = space();
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t1 = space();
    			label_1 = element("label");
    			h5 = element("h5");
    			t2 = text(/*label*/ ctx[2]);
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "id", /*uniqueId*/ ctx[3]);
    			attr_dev(input, "onclick", "this.blur();");
    			attr_dev(input, "class", "svelte-1tw5jsl");
    			add_location(input, file$d, 19, 4, 505);
    			attr_dev(div0, "class", "checkmark w-6 h-6 rounded-full pointer-events-none flex items-center justify-center transition-all svelte-1tw5jsl");
    			toggle_class(div0, "checked", /*checked*/ ctx[0]);
    			add_location(div0, file$d, 29, 4, 717);
    			attr_dev(h5, "class", "m-0 text-xs");
    			add_location(h5, file$d, 37, 8, 1040);
    			attr_dev(label_1, "for", /*uniqueId*/ ctx[3]);
    			attr_dev(label_1, "class", "pointer-events-none");
    			add_location(label_1, file$d, 36, 4, 981);
    			attr_dev(div1, "class", "container flex gap-2 relative items-center cursor-pointer svelte-1tw5jsl");
    			add_location(div1, file$d, 18, 0, 411);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, input);
    			input.checked = /*checked*/ ctx[0];
    			set_input_value(input, /*value*/ ctx[1]);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div1, t1);
    			append_dev(div1, label_1);
    			append_dev(label_1, h5);
    			append_dev(h5, t2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[8]),
    					listen_dev(input, "change", /*change_handler*/ ctx[5], false, false, false),
    					listen_dev(input, "focus", /*focus_handler*/ ctx[6], false, false, false),
    					listen_dev(input, "blur", /*blur_handler*/ ctx[7], false, false, false),
    					listen_dev(div1, "click", /*toggle*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}

    			if (dirty & /*value*/ 2) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}

    			if (/*checked*/ ctx[0]) {
    				if (if_block) {
    					if (dirty & /*checked*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*checked*/ 1) {
    				toggle_class(div0, "checked", /*checked*/ ctx[0]);
    			}

    			if (!current || dirty & /*label*/ 4) set_data_dev(t2, /*label*/ ctx[2]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Checkbox', slots, []);
    	const dispatch = createEventDispatcher();
    	let { checked } = $$props;
    	let { label } = $$props;
    	let { value } = $$props;
    	let uniqueId = 'checkbox--' + (Math.random() * 10000000).toFixed(0).toString();

    	const toggle = () => {
    		$$invalidate(0, checked = !checked);
    		dispatch("change");
    	};

    	const writable_props = ['checked', 'label', 'value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Checkbox> was created with unknown prop '${key}'`);
    	});

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_change_handler() {
    		checked = this.checked;
    		value = this.value;
    		$$invalidate(0, checked);
    		$$invalidate(1, value);
    	}

    	$$self.$$set = $$props => {
    		if ('checked' in $$props) $$invalidate(0, checked = $$props.checked);
    		if ('label' in $$props) $$invalidate(2, label = $$props.label);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		fade,
    		dispatch,
    		checked,
    		label,
    		value,
    		uniqueId,
    		toggle
    	});

    	$$self.$inject_state = $$props => {
    		if ('checked' in $$props) $$invalidate(0, checked = $$props.checked);
    		if ('label' in $$props) $$invalidate(2, label = $$props.label);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    		if ('uniqueId' in $$props) $$invalidate(3, uniqueId = $$props.uniqueId);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		checked,
    		value,
    		label,
    		uniqueId,
    		toggle,
    		change_handler,
    		focus_handler,
    		blur_handler,
    		input_change_handler
    	];
    }

    class Checkbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { checked: 0, label: 2, value: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Checkbox",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*checked*/ ctx[0] === undefined && !('checked' in props)) {
    			console.warn("<Checkbox> was created without expected prop 'checked'");
    		}

    		if (/*label*/ ctx[2] === undefined && !('label' in props)) {
    			console.warn("<Checkbox> was created without expected prop 'label'");
    		}

    		if (/*value*/ ctx[1] === undefined && !('value' in props)) {
    			console.warn("<Checkbox> was created without expected prop 'value'");
    		}
    	}

    	get checked() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Checkbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Checkbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$a = ".input.svelte-170yr2b{position:relative;transition:flex 0s .2s}input.svelte-170yr2b{align-items:center;background-color:var(--figma-color-bg);border:1px solid transparent;border-radius:var(--border-radius-small);color:var(--figma-color-text);display:flex;font-size:var(--font-size-xsmall);font-weight:var(--font-weight-normal);height:30px;letter-spacing:var(--font-letter-spacing-neg-xsmall);line-height:var(--line-height);margin:1px 0;outline:none;overflow:visible;padding:var(--size-xxsmall) var(--size-xxxsmall) var(--size-xxsmall) var(--size-xxsmall);position:relative;width:100%}input.svelte-170yr2b:-moz-placeholder-shown:hover{background-image:none;border:1px solid var(--figma-color-border);color:var(--figma-color-text-hover)}input.svelte-170yr2b:hover,input.svelte-170yr2b:placeholder-shown:hover{background-image:none;border:1px solid var(--figma-color-border);color:var(--figma-color-text-hover)}input.svelte-170yr2b::-moz-selection{background-color:var(--text-highlight);color:var(--figma-color-text)}input.svelte-170yr2b::selection{background-color:var(--text-highlight);color:var(--figma-color-text)}input.svelte-170yr2b::-moz-placeholder{border:1px solid transparent;color:var(--figma-color-text-tertiary)}input.svelte-170yr2b::placeholder{border:1px solid transparent;color:var(--figma-color-text-tertiary)}input.svelte-170yr2b:-moz-placeholder-shown{background-image:none;border:1px solid var(--figma-color-border);color:var(--figma-color-text)}input.svelte-170yr2b:placeholder-shown{background-image:none;border:1px solid var(--figma-color-border);color:var(--figma-color-text)}input.svelte-170yr2b:focus:-moz-placeholder-shown{border:1px solid var(--figma-color-border-selected);outline:1px solid var(--figma-color-border-selected);outline-offset:-2px}input.svelte-170yr2b:focus:placeholder-shown{border:1px solid var(--figma-color-border-selected);outline:1px solid var(--figma-color-border-selected);outline-offset:-2px}input.svelte-170yr2b:disabled:hover{border:1px solid transparent}input.svelte-170yr2b:active,input.svelte-170yr2b:focus{border:1px solid var(--figma-color-border-selected);color:var(--figma-color-text);outline:1px solid var(--figma-color-border-selected);outline-offset:-2px}input.svelte-170yr2b:disabled{background-image:none;color:var(--figma-color-text-disabled);position:relative}input.svelte-170yr2b:disabled:active{outline:none}.borders.svelte-170yr2b{background-image:none;border:1px solid var(--figma-color-border)}.borders.svelte-170yr2b:disabled{background-image:none;border:1px solid transparent}.borders.svelte-170yr2b:disabled:-moz-placeholder-shown{background-image:none;border:1px solid transparent}.borders.svelte-170yr2b:disabled:placeholder-shown{background-image:none;border:1px solid transparent}.borders.svelte-170yr2b:disabled:-moz-placeholder-shown:active{border:1px solid transparent;outline:none}.borders.svelte-170yr2b:disabled:placeholder-shown:active{border:1px solid transparent;outline:none}.borders.svelte-170yr2b:-moz-placeholder-shown{background-image:none;border:1px solid var(--figma-color-border)}.borders.svelte-170yr2b:placeholder-shown{background-image:none;border:1px solid var(--figma-color-border)}.indent.svelte-170yr2b{padding-left:32px}.invalid.svelte-170yr2b,.invalid.svelte-170yr2b:focus,.invalid.svelte-170yr2b:hover{border:1px solid var(--figma-color-border-danger-strong);outline:1px solid var(--figma-color-border-danger-strong);outline-offset:-2px}.icon.svelte-170yr2b{height:var(--size-medium);left:0;position:absolute;top:-1px;width:var(--size-medium);z-index:1}.error.svelte-170yr2b{color:var(--figma-color-text-danger);font-size:var(--font-size-xsmall);font-weight:var(--font-weight-normal);letter-spacing:var(--font-letter-spacing-neg-xsmall);line-height:var(--line-height);padding-left:var(--size-xxsmall);padding-top:var(--size-xxxsmall)}";
    styleInject(css_248z$a);

    /* src/lib/components/Inputs/Input.svelte generated by Svelte v3.48.0 */

    const file$c = "src/lib/components/Inputs/Input.svelte";

    // (34:2) {#if invalid}
    function create_if_block$6(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*errorMessage*/ ctx[7]);
    			attr_dev(div, "class", "error svelte-170yr2b");
    			add_location(div, file$c, 34, 4, 661);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMessage*/ 128) set_data_dev(t, /*errorMessage*/ ctx[7]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(34:2) {#if invalid}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let div;
    	let input;
    	let t;
    	let div_class_value;
    	let mounted;
    	let dispose;
    	let if_block = /*invalid*/ ctx[6] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(input, "type", "input");
    			attr_dev(input, "id", /*id*/ ctx[2]);
    			attr_dev(input, "name", /*name*/ ctx[3]);
    			input.disabled = /*disabled*/ ctx[5];
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[8]);
    			attr_dev(input, "errormessage", /*errorMessage*/ ctx[7]);
    			attr_dev(input, "class", "svelte-170yr2b");
    			toggle_class(input, "borders", /*borders*/ ctx[4]);
    			toggle_class(input, "invalid", /*invalid*/ ctx[6]);
    			add_location(input, file$c, 16, 2, 402);
    			attr_dev(div, "class", div_class_value = "input " + /*className*/ ctx[9] + " svelte-170yr2b");
    			add_location(div, file$c, 15, 0, 368);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*value*/ ctx[0]);
    			/*input_binding*/ ctx[16](input);
    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_handler*/ ctx[10], false, false, false),
    					listen_dev(input, "change", /*change_handler*/ ctx[11], false, false, false),
    					listen_dev(input, "keydown", /*keydown_handler*/ ctx[12], false, false, false),
    					listen_dev(input, "focus", /*focus_handler*/ ctx[13], false, false, false),
    					listen_dev(input, "blur", /*blur_handler*/ ctx[14], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[15])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*id*/ 4) {
    				attr_dev(input, "id", /*id*/ ctx[2]);
    			}

    			if (dirty & /*name*/ 8) {
    				attr_dev(input, "name", /*name*/ ctx[3]);
    			}

    			if (dirty & /*disabled*/ 32) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[5]);
    			}

    			if (dirty & /*placeholder*/ 256) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[8]);
    			}

    			if (dirty & /*errorMessage*/ 128) {
    				attr_dev(input, "errormessage", /*errorMessage*/ ctx[7]);
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (dirty & /*borders*/ 16) {
    				toggle_class(input, "borders", /*borders*/ ctx[4]);
    			}

    			if (dirty & /*invalid*/ 64) {
    				toggle_class(input, "invalid", /*invalid*/ ctx[6]);
    			}

    			if (/*invalid*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$6(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*className*/ 512 && div_class_value !== (div_class_value = "input " + /*className*/ ctx[9] + " svelte-170yr2b")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*input_binding*/ ctx[16](null);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Input', slots, []);
    	let { id = null } = $$props;
    	let { value = null } = $$props;
    	let { name = null } = $$props;
    	let { borders = false } = $$props;
    	let { disabled = false } = $$props;
    	let { invalid = false } = $$props;
    	let { errorMessage = "Error message" } = $$props;
    	let { placeholder = "Input something here..." } = $$props;
    	let { ref = null } = $$props;
    	let { class: className = "" } = $$props;

    	const writable_props = [
    		'id',
    		'value',
    		'name',
    		'borders',
    		'disabled',
    		'invalid',
    		'errorMessage',
    		'placeholder',
    		'ref',
    		'class'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	function input_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ref = $$value;
    			$$invalidate(1, ref);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(2, id = $$props.id);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('name' in $$props) $$invalidate(3, name = $$props.name);
    		if ('borders' in $$props) $$invalidate(4, borders = $$props.borders);
    		if ('disabled' in $$props) $$invalidate(5, disabled = $$props.disabled);
    		if ('invalid' in $$props) $$invalidate(6, invalid = $$props.invalid);
    		if ('errorMessage' in $$props) $$invalidate(7, errorMessage = $$props.errorMessage);
    		if ('placeholder' in $$props) $$invalidate(8, placeholder = $$props.placeholder);
    		if ('ref' in $$props) $$invalidate(1, ref = $$props.ref);
    		if ('class' in $$props) $$invalidate(9, className = $$props.class);
    	};

    	$$self.$capture_state = () => ({
    		id,
    		value,
    		name,
    		borders,
    		disabled,
    		invalid,
    		errorMessage,
    		placeholder,
    		ref,
    		className
    	});

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(2, id = $$props.id);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('name' in $$props) $$invalidate(3, name = $$props.name);
    		if ('borders' in $$props) $$invalidate(4, borders = $$props.borders);
    		if ('disabled' in $$props) $$invalidate(5, disabled = $$props.disabled);
    		if ('invalid' in $$props) $$invalidate(6, invalid = $$props.invalid);
    		if ('errorMessage' in $$props) $$invalidate(7, errorMessage = $$props.errorMessage);
    		if ('placeholder' in $$props) $$invalidate(8, placeholder = $$props.placeholder);
    		if ('ref' in $$props) $$invalidate(1, ref = $$props.ref);
    		if ('className' in $$props) $$invalidate(9, className = $$props.className);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		ref,
    		id,
    		name,
    		borders,
    		disabled,
    		invalid,
    		errorMessage,
    		placeholder,
    		className,
    		input_handler,
    		change_handler,
    		keydown_handler,
    		focus_handler,
    		blur_handler,
    		input_input_handler,
    		input_binding
    	];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			id: 2,
    			value: 0,
    			name: 3,
    			borders: 4,
    			disabled: 5,
    			invalid: 6,
    			errorMessage: 7,
    			placeholder: 8,
    			ref: 1,
    			class: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get id() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get borders() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set borders(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get invalid() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set invalid(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get errorMessage() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errorMessage(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ref() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ref(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$9 = "li.svelte-15kt2e{align-items:center;color:var(--white);cursor:default;display:flex;font-family:var(--font-stack);font-size:var(--font-size-small);font-weight:var(--font-weight-normal);height:var(--size-small);letter-spacing:var(--font-letter-spacing-neg-xsmall);line-height:var(--font-line-height);outline:none;padding:0 var(--size-xsmall) 0 var(--size-xxsmall);transition-duration:30ms;transition-property:background-color;-webkit-user-select:none;-moz-user-select:none;user-select:none}.label.svelte-15kt2e{overflow-x:hidden;pointer-events:none;text-overflow:ellipsis;white-space:nowrap}.highlight.svelte-15kt2e,li.svelte-15kt2e:focus,li.svelte-15kt2e:hover{background-color:var(--blue)}.icon.svelte-15kt2e{background-image:url(\"data:image/svg+xml;utf8,%3Csvg%20fill%3D%22none%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%20width%3D%2216%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20clip-rule%3D%22evenodd%22%20d%3D%22m13.2069%205.20724-5.50002%205.49996-.70711.7072-.70711-.7072-3-2.99996%201.41422-1.41421%202.29289%202.29289%204.79293-4.79289z%22%20fill%3D%22%23fff%22%20fill-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E\");background-position:50%;background-repeat:no-repeat;height:var(--size-xsmall);margin-right:var(--size-xxsmall);opacity:0;pointer-events:none;width:var(--size-xsmall)}.icon.selected.svelte-15kt2e{opacity:1}.blink.svelte-15kt2e,.blink.svelte-15kt2e:hover{background-color:transparent}";
    styleInject(css_248z$9);

    /* src/lib/components/Inputs/SelectItem.svelte generated by Svelte v3.48.0 */

    const file$b = "src/lib/components/Inputs/SelectItem.svelte";

    function create_fragment$b(ctx) {
    	let li;
    	let div0;
    	let t;
    	let div1;
    	let li_tabindex_value;
    	let li_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			li = element("li");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "icon svelte-15kt2e");
    			toggle_class(div0, "selected", /*selected*/ ctx[1]);
    			add_location(div0, file$b, 9, 2, 234);
    			attr_dev(div1, "class", "label svelte-15kt2e");
    			add_location(div1, file$b, 10, 2, 272);
    			attr_dev(li, "itemid", /*itemId*/ ctx[0]);
    			attr_dev(li, "tabindex", li_tabindex_value = /*itemId*/ ctx[0] + 1);
    			attr_dev(li, "class", li_class_value = "" + (null_to_empty(/*className*/ ctx[2]) + " svelte-15kt2e"));
    			toggle_class(li, "highlight", /*selected*/ ctx[1]);
    			add_location(li, file$b, 8, 0, 128);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div0);
    			append_dev(li, t);
    			append_dev(li, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(li, "mouseenter", /*mouseenter_handler*/ ctx[5], false, false, false),
    					listen_dev(li, "click", /*click_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*selected*/ 2) {
    				toggle_class(div0, "selected", /*selected*/ ctx[1]);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*itemId*/ 1) {
    				attr_dev(li, "itemid", /*itemId*/ ctx[0]);
    			}

    			if (!current || dirty & /*itemId*/ 1 && li_tabindex_value !== (li_tabindex_value = /*itemId*/ ctx[0] + 1)) {
    				attr_dev(li, "tabindex", li_tabindex_value);
    			}

    			if (!current || dirty & /*className*/ 4 && li_class_value !== (li_class_value = "" + (null_to_empty(/*className*/ ctx[2]) + " svelte-15kt2e"))) {
    				attr_dev(li, "class", li_class_value);
    			}

    			if (dirty & /*className, selected*/ 6) {
    				toggle_class(li, "highlight", /*selected*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SelectItem', slots, ['default']);
    	let { itemId } = $$props;
    	let { selected = false } = $$props;
    	let { class: className = "" } = $$props;
    	const writable_props = ['itemId', 'selected', 'class'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SelectItem> was created with unknown prop '${key}'`);
    	});

    	function mouseenter_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('itemId' in $$props) $$invalidate(0, itemId = $$props.itemId);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('class' in $$props) $$invalidate(2, className = $$props.class);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ itemId, selected, className });

    	$$self.$inject_state = $$props => {
    		if ('itemId' in $$props) $$invalidate(0, itemId = $$props.itemId);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('className' in $$props) $$invalidate(2, className = $$props.className);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [itemId, selected, className, $$scope, slots, mouseenter_handler, click_handler];
    }

    class SelectItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { itemId: 0, selected: 1, class: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectItem",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*itemId*/ ctx[0] === undefined && !('itemId' in props)) {
    			console.warn("<SelectItem> was created without expected prop 'itemId'");
    		}
    	}

    	get itemId() {
    		throw new Error("<SelectItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itemId(value) {
    		throw new Error("<SelectItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<SelectItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<SelectItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<SelectItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<SelectItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$8 = ".label.svelte-1d7a60v{align-items:center;color:var(--white4);display:flex;font-size:var(--font-size-small);font-weight:var(--font-weight-normal);height:var(--size-small);letter-spacing:var(--font-letter-spacing-neg-small);line-height:var(--line-height);margin-top:var(--size-xxsmall);padding:0 var(--size-xxsmall) 0 var(--size-medium)}.label.svelte-1d7a60v:first-child{border-top:none;margin-top:0}.divider.svelte-1d7a60v{background-color:var(--white2);display:block;height:1px;margin:8px 0 7px}";
    styleInject(css_248z$8);

    /* src/lib/components/Inputs/SelectDivider.svelte generated by Svelte v3.48.0 */

    const file$a = "src/lib/components/Inputs/SelectDivider.svelte";

    // (7:0) {:else}
    function create_else_block$1(ctx) {
    	let li;

    	const block = {
    		c: function create() {
    			li = element("li");
    			attr_dev(li, "class", "divider svelte-1d7a60v");
    			add_location(li, file$a, 7, 2, 113);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(7:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (5:0) {#if label === true}
    function create_if_block$5(ctx) {
    	let li;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			li = element("li");
    			if (default_slot) default_slot.c();
    			attr_dev(li, "class", "label svelte-1d7a60v");
    			add_location(li, file$a, 5, 2, 71);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			if (default_slot) {
    				default_slot.m(li, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(5:0) {#if label === true}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$5, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*label*/ ctx[0] === true) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SelectDivider', slots, ['default']);
    	let { label = false } = $$props;
    	const writable_props = ['label'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SelectDivider> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('label' in $$props) $$invalidate(0, label = $$props.label);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ label });

    	$$self.$inject_state = $$props => {
    		if ('label' in $$props) $$invalidate(0, label = $$props.label);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [label, $$scope, slots];
    }

    class SelectDivider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { label: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectDivider",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get label() {
    		throw new Error("<SelectDivider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<SelectDivider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$7 = ".wrapper.svelte-17lv9wa.svelte-17lv9wa{position:relative;width:100%}button.svelte-17lv9wa.svelte-17lv9wa{align-items:center;background-color:var(--figma-color-bg-brand-secondary);border:none;border-radius:8px;display:flex;height:36px!important;justify-content:space-between;margin:0 0 4px!important;min-width:100px;overflow-y:hidden;padding:0 var(--size-xxsmall) 0 var(--size-xxsmall);width:100%}button.svelte-17lv9wa:hover .placeholder.svelte-17lv9wa{color:var(--black8)}button.svelte-17lv9wa.svelte-17lv9wa:focus{border:1px solid var(--blue);outline:1px solid var(--blue);outline-offset:-2px}button.svelte-17lv9wa:focus .placeholder.svelte-17lv9wa{color:var(--black8)}button.svelte-17lv9wa:disabled .label.svelte-17lv9wa{color:var(--black3)}button.svelte-17lv9wa.svelte-17lv9wa:disabled:hover{border-color:transparent;justify-content:flex-start}button.svelte-17lv9wa:disabled:hover .placeholder.svelte-17lv9wa{color:var(--black3)}button.svelte-17lv9wa .svelte-17lv9wa{pointer-events:none}.label.svelte-17lv9wa.svelte-17lv9wa,.placeholder.svelte-17lv9wa.svelte-17lv9wa{color:var(--black8);font-size:var(--font-size-xsmall);font-weight:var(--font-weight-normal);letter-spacing:var(--font-letter-spacing-neg-xsmall);line-height:var(--line-height);margin-right:6px;margin-top:-3px;overflow-x:hidden;text-overflow:ellipsis;white-space:nowrap}.placeholder.svelte-17lv9wa.svelte-17lv9wa{color:var(--black3)}.caret.svelte-17lv9wa.svelte-17lv9wa{display:block;margin-top:-1px}.menu.svelte-17lv9wa.svelte-17lv9wa{background-color:var(--hud);border-radius:var(--border-radius-small);box-shadow:var(--shadow-hud);left:0;margin:0;overflow-x:overlay;overflow-y:auto;padding:var(--size-xxsmall) 0 var(--size-xxsmall) 0;position:absolute;top:32px;width:100%;z-index:50}.menu.svelte-17lv9wa.svelte-17lv9wa::-webkit-scrollbar{background-color:transparent;background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=);background-repeat:repeat;background-size:100% auto;width:12px}.menu.svelte-17lv9wa.svelte-17lv9wa::-webkit-scrollbar-track{border:3px solid transparent;box-shadow:inset 0 0 10px 10px transparent}.menu.svelte-17lv9wa.svelte-17lv9wa::-webkit-scrollbar-thumb{border:3px solid transparent;border-radius:6px;box-shadow:inset 0 0 10px 10px hsla(0,0%,100%,.4)}";
    styleInject(css_248z$7);

    /* src/lib/components/Inputs/SelectMenu.svelte generated by Svelte v3.48.0 */
    const file$9 = "src/lib/components/Inputs/SelectMenu.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	child_ctx[26] = list;
    	child_ctx[27] = i;
    	return child_ctx;
    }

    // (199:6) {#if iconName}
    function create_if_block_7(ctx) {
    	let i;
    	let i_class_value;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", i_class_value = "text-xs ml-1 mr-0 fa-sharp fa-solid fa-" + /*iconName*/ ctx[4] + " svelte-17lv9wa");
    			add_location(i, file$9, 199, 8, 6273);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*iconName*/ 16 && i_class_value !== (i_class_value = "text-xs ml-1 mr-0 fa-sharp fa-solid fa-" + /*iconName*/ ctx[4] + " svelte-17lv9wa")) {
    				attr_dev(i, "class", i_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(199:6) {#if iconName}",
    		ctx
    	});

    	return block;
    }

    // (205:6) {:else}
    function create_else_block_1(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*placeholder*/ ctx[2]);
    			attr_dev(span, "class", "placeholder svelte-17lv9wa");
    			add_location(span, file$9, 205, 8, 6439);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*placeholder*/ 4) set_data_dev(t, /*placeholder*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(205:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (203:6) {#if value}
    function create_if_block_6(ctx) {
    	let span;
    	let t_value = /*value*/ ctx[3].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "label svelte-17lv9wa");
    			add_location(span, file$9, 203, 8, 6376);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 8 && t_value !== (t_value = /*value*/ ctx[3].label + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(203:6) {#if value}",
    		ctx
    	});

    	return block;
    }

    // (209:6) {#if !disabled}
    function create_if_block_5(ctx) {
    	let span;
    	let i;

    	const block = {
    		c: function create() {
    			span = element("span");
    			i = element("i");
    			attr_dev(i, "class", "fa-sharp fa-solid fa-chevron-down fa-sm svelte-17lv9wa");
    			add_location(i, file$9, 210, 10, 6560);
    			attr_dev(span, "class", "caret svelte-17lv9wa");
    			add_location(span, file$9, 209, 8, 6529);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, i);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(209:6) {#if !disabled}",
    		ctx
    	});

    	return block;
    }

    // (217:6) {#if menuItems && menuItems.length > 0}
    function create_if_block$4(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*menuItems*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menuItems, menuClick, removeHighlight, showGroupLabels*/ 2113) {
    				each_value = /*menuItems*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(217:6) {#if menuItems && menuItems.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (223:80) 
    function create_if_block_3$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_4, create_else_block];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*showGroupLabels*/ ctx[6]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(223:80) ",
    		ctx
    	});

    	return block;
    }

    // (219:10) {#if i === 0}
    function create_if_block_1$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*item*/ ctx[25].group && /*showGroupLabels*/ ctx[6] && create_if_block_2$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*item*/ ctx[25].group && /*showGroupLabels*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*menuItems, showGroupLabels*/ 65) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(219:10) {#if i === 0}",
    		ctx
    	});

    	return block;
    }

    // (227:12) {:else}
    function create_else_block(ctx) {
    	let selectdivider;
    	let current;
    	selectdivider = new SelectDivider({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(selectdivider.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(selectdivider, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectdivider.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectdivider.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(selectdivider, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(227:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (224:12) {#if showGroupLabels}
    function create_if_block_4(ctx) {
    	let selectdivider0;
    	let t;
    	let selectdivider1;
    	let current;
    	selectdivider0 = new SelectDivider({ $$inline: true });

    	selectdivider1 = new SelectDivider({
    			props: {
    				label: true,
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(selectdivider0.$$.fragment);
    			t = space();
    			create_component(selectdivider1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(selectdivider0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(selectdivider1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const selectdivider1_changes = {};

    			if (dirty & /*$$scope, menuItems*/ 268435457) {
    				selectdivider1_changes.$$scope = { dirty, ctx };
    			}

    			selectdivider1.$set(selectdivider1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectdivider0.$$.fragment, local);
    			transition_in(selectdivider1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectdivider0.$$.fragment, local);
    			transition_out(selectdivider1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(selectdivider0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(selectdivider1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(224:12) {#if showGroupLabels}",
    		ctx
    	});

    	return block;
    }

    // (226:14) <SelectDivider label>
    function create_default_slot_3$1(ctx) {
    	let t_value = /*item*/ ctx[25].group + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menuItems*/ 1 && t_value !== (t_value = /*item*/ ctx[25].group + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(226:14) <SelectDivider label>",
    		ctx
    	});

    	return block;
    }

    // (220:12) {#if item.group && showGroupLabels}
    function create_if_block_2$2(ctx) {
    	let selectdivider;
    	let current;

    	selectdivider = new SelectDivider({
    			props: {
    				label: true,
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(selectdivider.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(selectdivider, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const selectdivider_changes = {};

    			if (dirty & /*$$scope, menuItems*/ 268435457) {
    				selectdivider_changes.$$scope = { dirty, ctx };
    			}

    			selectdivider.$set(selectdivider_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectdivider.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectdivider.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(selectdivider, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(220:12) {#if item.group && showGroupLabels}",
    		ctx
    	});

    	return block;
    }

    // (221:14) <SelectDivider label>
    function create_default_slot_2$1(ctx) {
    	let t_value = /*item*/ ctx[25].group + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menuItems*/ 1 && t_value !== (t_value = /*item*/ ctx[25].group + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(221:14) <SelectDivider label>",
    		ctx
    	});

    	return block;
    }

    // (231:10) <SelectItem             on:click={menuClick}             on:mouseenter={removeHighlight}             itemId={item.id}             bind:selected={item.selected}>
    function create_default_slot_1$1(ctx) {
    	let t_value = /*item*/ ctx[25].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*menuItems*/ 1 && t_value !== (t_value = /*item*/ ctx[25].label + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(231:10) <SelectItem             on:click={menuClick}             on:mouseenter={removeHighlight}             itemId={item.id}             bind:selected={item.selected}>",
    		ctx
    	});

    	return block;
    }

    // (218:8) {#each menuItems as item, i}
    function create_each_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let selectitem;
    	let updating_selected;
    	let current;
    	const if_block_creators = [create_if_block_1$3, create_if_block_3$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*i*/ ctx[27] === 0) return 0;
    		if (/*i*/ ctx[27] > 0 && /*item*/ ctx[25].group && /*menuItems*/ ctx[0][/*i*/ ctx[27] - 1].group != /*item*/ ctx[25].group) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	function selectitem_selected_binding(value) {
    		/*selectitem_selected_binding*/ ctx[16](value, /*item*/ ctx[25]);
    	}

    	let selectitem_props = {
    		itemId: /*item*/ ctx[25].id,
    		$$slots: { default: [create_default_slot_1$1] },
    		$$scope: { ctx }
    	};

    	if (/*item*/ ctx[25].selected !== void 0) {
    		selectitem_props.selected = /*item*/ ctx[25].selected;
    	}

    	selectitem = new SelectItem({ props: selectitem_props, $$inline: true });
    	binding_callbacks.push(() => bind(selectitem, 'selected', selectitem_selected_binding));
    	selectitem.$on("click", /*menuClick*/ ctx[11]);
    	selectitem.$on("mouseenter", removeHighlight);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			create_component(selectitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			mount_component(selectitem, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				} else {
    					if_block = null;
    				}
    			}

    			const selectitem_changes = {};
    			if (dirty & /*menuItems*/ 1) selectitem_changes.itemId = /*item*/ ctx[25].id;

    			if (dirty & /*$$scope, menuItems*/ 268435457) {
    				selectitem_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_selected && dirty & /*menuItems*/ 1) {
    				updating_selected = true;
    				selectitem_changes.selected = /*item*/ ctx[25].selected;
    				add_flush_callback(() => updating_selected = false);
    			}

    			selectitem.$set(selectitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(selectitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(selectitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(t);
    			destroy_component(selectitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(218:8) {#each menuItems as item, i}",
    		ctx
    	});

    	return block;
    }

    // (186:0) <ClickOutside on:clickoutside={menuClick}>
    function create_default_slot$2(ctx) {
    	let div;
    	let button;
    	let t0;
    	let t1;
    	let t2;
    	let ul;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*iconName*/ ctx[4] && create_if_block_7(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*value*/ ctx[3]) return create_if_block_6;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);
    	let if_block2 = !/*disabled*/ ctx[1] && create_if_block_5(ctx);
    	let if_block3 = /*menuItems*/ ctx[0] && /*menuItems*/ ctx[0].length > 0 && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			ul = element("ul");
    			if (if_block3) if_block3.c();
    			button.disabled = /*disabled*/ ctx[1];
    			attr_dev(button, "class", "svelte-17lv9wa");
    			add_location(button, file$9, 197, 4, 6180);
    			attr_dev(ul, "class", "hidden menu svelte-17lv9wa");
    			add_location(ul, file$9, 215, 4, 6661);
    			attr_dev(div, "disabled", /*disabled*/ ctx[1]);
    			attr_dev(div, "placeholder", /*placeholder*/ ctx[2]);
    			attr_dev(div, "showgrouplabels", /*showGroupLabels*/ ctx[6]);
    			attr_dev(div, "macosblink", /*macOSBlink*/ ctx[5]);
    			attr_dev(div, "class", div_class_value = "wrapper " + /*className*/ ctx[7] + " svelte-17lv9wa");
    			add_location(div, file$9, 186, 2, 5996);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			if (if_block0) if_block0.m(button, null);
    			append_dev(button, t0);
    			if_block1.m(button, null);
    			append_dev(button, t1);
    			if (if_block2) if_block2.m(button, null);
    			/*button_binding*/ ctx[15](button);
    			append_dev(div, t2);
    			append_dev(div, ul);
    			if (if_block3) if_block3.m(ul, null);
    			/*ul_binding*/ ctx[17](ul);
    			/*div_binding*/ ctx[18](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*menuClick*/ ctx[11], false, false, false),
    					listen_dev(div, "change", /*change_handler*/ ctx[12], false, false, false),
    					listen_dev(div, "focus", /*focus_handler*/ ctx[13], false, false, false),
    					listen_dev(div, "blur", /*blur_handler*/ ctx[14], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*iconName*/ ctx[4]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					if_block0.m(button, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(button, t1);
    				}
    			}

    			if (!/*disabled*/ ctx[1]) {
    				if (if_block2) ; else {
    					if_block2 = create_if_block_5(ctx);
    					if_block2.c();
    					if_block2.m(button, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (!current || dirty & /*disabled*/ 2) {
    				prop_dev(button, "disabled", /*disabled*/ ctx[1]);
    			}

    			if (/*menuItems*/ ctx[0] && /*menuItems*/ ctx[0].length > 0) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*menuItems*/ 1) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block$4(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(ul, null);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*disabled*/ 2) {
    				attr_dev(div, "disabled", /*disabled*/ ctx[1]);
    			}

    			if (!current || dirty & /*placeholder*/ 4) {
    				attr_dev(div, "placeholder", /*placeholder*/ ctx[2]);
    			}

    			if (!current || dirty & /*showGroupLabels*/ 64) {
    				attr_dev(div, "showgrouplabels", /*showGroupLabels*/ ctx[6]);
    			}

    			if (!current || dirty & /*macOSBlink*/ 32) {
    				attr_dev(div, "macosblink", /*macOSBlink*/ ctx[5]);
    			}

    			if (!current || dirty & /*className*/ 128 && div_class_value !== (div_class_value = "wrapper " + /*className*/ ctx[7] + " svelte-17lv9wa")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			if (if_block2) if_block2.d();
    			/*button_binding*/ ctx[15](null);
    			if (if_block3) if_block3.d();
    			/*ul_binding*/ ctx[17](null);
    			/*div_binding*/ ctx[18](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(186:0) <ClickOutside on:clickoutside={menuClick}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let clickoutside;
    	let current;

    	clickoutside = new Src({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	clickoutside.$on("clickoutside", /*menuClick*/ ctx[11]);

    	const block = {
    		c: function create() {
    			create_component(clickoutside.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(clickoutside, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const clickoutside_changes = {};

    			if (dirty & /*$$scope, disabled, placeholder, showGroupLabels, macOSBlink, className, menuWrapper, menuList, menuItems, menuButton, value, iconName*/ 268437503) {
    				clickoutside_changes.$$scope = { dirty, ctx };
    			}

    			clickoutside.$set(clickoutside_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(clickoutside.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(clickoutside.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(clickoutside, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function removeHighlight(event) {
    	let items = Array.from(event.target.parentNode.children);

    	items.forEach(item => {
    		item.blur();
    		item.classList.remove("highlight");
    	});
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SelectMenu', slots, []);
    	let { iconName = null } = $$props;
    	let { disabled = false } = $$props;
    	let { macOSBlink = false } = $$props;
    	let { menuItems = [] } = $$props;
    	let { placeholder = "Please make a selection." } = $$props;
    	let { value = null } = $$props;
    	let { showGroupLabels = false } = $$props;
    	const dispatch = createEventDispatcher();
    	let { class: className = "" } = $$props;
    	let groups = checkGroups();
    	let menuWrapper, menuButton, menuList;

    	//FUNCTIONS
    	//assign id's to the input array
    	onMount(async () => {
    		updateSelectedAndIds();
    	});

    	// this function runs everytime the menuItems array os updated
    	// it will auto assign ids and keep the value var updated
    	function updateSelectedAndIds() {
    		if (menuItems) {
    			menuItems.forEach((item, index) => {
    				//update id
    				item["id"] = index;

    				//update selection
    				if (item.selected === true) {
    					$$invalidate(3, value = item);
    				}
    			});
    		}

    		//set placeholder
    		if (menuItems.length <= 0) {
    			$$invalidate(2, placeholder = "There are no items to select");
    			$$invalidate(1, disabled = true);
    		} else {
    			$$invalidate(1, disabled = false);
    		}
    	}

    	//determine if option groups are present
    	function checkGroups() {
    		let groupCount = 0;

    		if (menuItems) {
    			menuItems.forEach(item => {
    				if (item.group != null) {
    					groupCount++;
    				}
    			});

    			if (groupCount === menuItems.length) {
    				return true;
    			} else {
    				return false;
    			}
    		}

    		return false;
    	}

    	//run for all menu click events
    	//this opens/closes the menu
    	function menuClick(event) {
    		resetMenuProperties();

    		if (!event.target) {
    			menuList.classList.add("hidden");
    		} else if (event.target.contains(menuButton)) {

    			if (value) {
    				//toggle menu
    				menuList.classList.remove("hidden");

    				let id = value.id;
    				let selectedItem = menuList.querySelector('[itemId="' + id + '"]') || menuList.querySelector('[itemId="0"]');
    				selectedItem.focus(); //set focus to the currently selected item

    				// calculate distance from top so that we can position the dropdown menu
    				let parentTop = menuList.getBoundingClientRect().top;

    				let itemTop = selectedItem.getBoundingClientRect().top;
    				let topPos = itemTop - parentTop - 3;
    				$$invalidate(10, menuList.style.top = -Math.abs(topPos) + "px", menuList);

    				//update size and position based on plugin UI
    				resizeAndPosition();
    			} else {
    				menuList.classList.remove("hidden");
    				$$invalidate(10, menuList.style.top = "0px", menuList);
    				let firstItem = menuList.querySelector('[itemId="0"]');
    				firstItem.focus();

    				//update size and position based on plugin UI
    				resizeAndPosition();
    			}
    		} else if (menuList.contains(event.target)) {
    			//find selected item in array
    			let itemId = parseInt(event.target.getAttribute("itemId"));

    			//remove current selection if there is one
    			if (typeof value === "object" && value && menuItems[value.id]) {
    				$$invalidate(0, menuItems[value.id].selected = false, menuItems);
    			}

    			$$invalidate(0, menuItems[itemId].selected = true, menuItems); //select current item
    			updateSelectedAndIds();
    			dispatch("change", menuItems[itemId]);

    			if (macOSBlink) {
    				var x = 4;
    				var interval = 70;

    				//blink the background
    				for (var i = 0; i < x; i++) {
    					setTimeout(
    						function () {
    							event.target.classList.toggle("blink");
    						},
    						i * interval
    					);
    				}

    				//delay closing the menu
    				setTimeout(
    					function () {
    						menuList.classList.add("hidden"); //hide the menu
    					},
    					interval * x + 40
    				);
    			} else {
    				menuList.classList.add("hidden"); //hide the menu
    				menuButton.classList.remove("selected"); //remove selected state from button
    			}
    		}
    	}

    	// this function ensures that the select menu
    	// fits inside the plugin viewport
    	// if its too big, it will resize it and enable a scrollbar
    	// if its off screen it will shift the position
    	function resizeAndPosition() {
    		//set the max height of the menu based on plugin/iframe window
    		let maxMenuHeight = window.innerHeight - 16;

    		let menuHeight = menuList.offsetHeight;
    		let menuResized = false;

    		if (menuHeight > maxMenuHeight) {
    			$$invalidate(10, menuList.style.height = maxMenuHeight + "px", menuList);
    			menuResized = true;
    		}

    		//lets adjust the position of the menu if its cut off from viewport
    		let bounding = menuList.getBoundingClientRect();

    		let parentBounding = menuButton.getBoundingClientRect();

    		if (bounding.top < 0) {
    			$$invalidate(10, menuList.style.top = -Math.abs(parentBounding.top - 8) + "px", menuList);
    		}

    		if (bounding.bottom > (window.innerHeight || document.documentElement.clientHeight)) {
    			let minTop = -Math.abs(parentBounding.top - (window.innerHeight - menuHeight - 8));
    			let newTop = -Math.abs(bounding.bottom - window.innerHeight + 16);

    			if (menuResized) {
    				$$invalidate(10, menuList.style.top = -Math.abs(parentBounding.top - 8) + "px", menuList);
    			} else if (newTop > minTop) {
    				$$invalidate(10, menuList.style.top = minTop + "px", menuList);
    			} else {
    				$$invalidate(10, menuList.style.top = newTop + "px", menuList);
    			}
    		}
    	}

    	function resetMenuProperties() {
    		$$invalidate(10, menuList.style.height = "auto", menuList);
    		$$invalidate(10, menuList.style.top = "0px", menuList);
    	}

    	const writable_props = [
    		'iconName',
    		'disabled',
    		'macOSBlink',
    		'menuItems',
    		'placeholder',
    		'value',
    		'showGroupLabels',
    		'class'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SelectMenu> was created with unknown prop '${key}'`);
    	});

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function button_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			menuButton = $$value;
    			$$invalidate(9, menuButton);
    		});
    	}

    	function selectitem_selected_binding(value, item) {
    		if ($$self.$$.not_equal(item.selected, value)) {
    			item.selected = value;
    			$$invalidate(0, menuItems);
    		}
    	}

    	function ul_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			menuList = $$value;
    			$$invalidate(10, menuList);
    		});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			menuWrapper = $$value;
    			$$invalidate(8, menuWrapper);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('iconName' in $$props) $$invalidate(4, iconName = $$props.iconName);
    		if ('disabled' in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ('macOSBlink' in $$props) $$invalidate(5, macOSBlink = $$props.macOSBlink);
    		if ('menuItems' in $$props) $$invalidate(0, menuItems = $$props.menuItems);
    		if ('placeholder' in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ('value' in $$props) $$invalidate(3, value = $$props.value);
    		if ('showGroupLabels' in $$props) $$invalidate(6, showGroupLabels = $$props.showGroupLabels);
    		if ('class' in $$props) $$invalidate(7, className = $$props.class);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		ClickOutside: Src,
    		SelectItem,
    		SelectDivider,
    		iconName,
    		disabled,
    		macOSBlink,
    		menuItems,
    		placeholder,
    		value,
    		showGroupLabels,
    		dispatch,
    		className,
    		groups,
    		menuWrapper,
    		menuButton,
    		menuList,
    		updateSelectedAndIds,
    		checkGroups,
    		removeHighlight,
    		menuClick,
    		resizeAndPosition,
    		resetMenuProperties
    	});

    	$$self.$inject_state = $$props => {
    		if ('iconName' in $$props) $$invalidate(4, iconName = $$props.iconName);
    		if ('disabled' in $$props) $$invalidate(1, disabled = $$props.disabled);
    		if ('macOSBlink' in $$props) $$invalidate(5, macOSBlink = $$props.macOSBlink);
    		if ('menuItems' in $$props) $$invalidate(0, menuItems = $$props.menuItems);
    		if ('placeholder' in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ('value' in $$props) $$invalidate(3, value = $$props.value);
    		if ('showGroupLabels' in $$props) $$invalidate(6, showGroupLabels = $$props.showGroupLabels);
    		if ('className' in $$props) $$invalidate(7, className = $$props.className);
    		if ('groups' in $$props) groups = $$props.groups;
    		if ('menuWrapper' in $$props) $$invalidate(8, menuWrapper = $$props.menuWrapper);
    		if ('menuButton' in $$props) $$invalidate(9, menuButton = $$props.menuButton);
    		if ('menuList' in $$props) $$invalidate(10, menuList = $$props.menuList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*menuItems*/ 1) {
    			(updateSelectedAndIds());
    		}
    	};

    	return [
    		menuItems,
    		disabled,
    		placeholder,
    		value,
    		iconName,
    		macOSBlink,
    		showGroupLabels,
    		className,
    		menuWrapper,
    		menuButton,
    		menuList,
    		menuClick,
    		change_handler,
    		focus_handler,
    		blur_handler,
    		button_binding,
    		selectitem_selected_binding,
    		ul_binding,
    		div_binding
    	];
    }

    class SelectMenu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			iconName: 4,
    			disabled: 1,
    			macOSBlink: 5,
    			menuItems: 0,
    			placeholder: 2,
    			value: 3,
    			showGroupLabels: 6,
    			class: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectMenu",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get iconName() {
    		throw new Error("<SelectMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconName(value) {
    		throw new Error("<SelectMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<SelectMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<SelectMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get macOSBlink() {
    		throw new Error("<SelectMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set macOSBlink(value) {
    		throw new Error("<SelectMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get menuItems() {
    		throw new Error("<SelectMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set menuItems(value) {
    		throw new Error("<SelectMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<SelectMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<SelectMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<SelectMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SelectMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showGroupLabels() {
    		throw new Error("<SelectMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showGroupLabels(value) {
    		throw new Error("<SelectMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<SelectMenu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<SelectMenu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$6 = ".input-row.svelte-1vju4z{display:flex;justify-content:flex-start;width:100%}";
    styleInject(css_248z$6);

    /* src/lib/components/Controls/File.svelte generated by Svelte v3.48.0 */
    const file$8 = "src/lib/components/Controls/File.svelte";

    function create_fragment$8(ctx) {
    	let div9;
    	let div3;
    	let div0;
    	let h50;
    	let t1;
    	let div2;
    	let div1;
    	let input;
    	let updating_value;
    	let t2;
    	let div7;
    	let div4;
    	let h51;
    	let t4;
    	let div6;
    	let div5;
    	let selectmenu;
    	let updating_menuItems;
    	let updating_value_1;
    	let t5;
    	let div8;
    	let checkbox;
    	let updating_value_2;
    	let updating_checked;
    	let current;

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[7](value);
    	}

    	let input_props = { placeholder: /*syntax*/ ctx[2] };

    	if (/*syntax*/ ctx[2] !== void 0) {
    		input_props.value = /*syntax*/ ctx[2];
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, 'value', input_value_binding));
    	input.$on("change", /*change_handler*/ ctx[8]);

    	function selectmenu_menuItems_binding(value) {
    		/*selectmenu_menuItems_binding*/ ctx[9](value);
    	}

    	function selectmenu_value_binding(value) {
    		/*selectmenu_value_binding*/ ctx[10](value);
    	}

    	let selectmenu_props = {};

    	if (/*menuItems*/ ctx[1] !== void 0) {
    		selectmenu_props.menuItems = /*menuItems*/ ctx[1];
    	}

    	if (/*fileType*/ ctx[0] !== void 0) {
    		selectmenu_props.value = /*fileType*/ ctx[0];
    	}

    	selectmenu = new SelectMenu({ props: selectmenu_props, $$inline: true });
    	binding_callbacks.push(() => bind(selectmenu, 'menuItems', selectmenu_menuItems_binding));
    	binding_callbacks.push(() => bind(selectmenu, 'value', selectmenu_value_binding));
    	selectmenu.$on("change", /*change_handler_1*/ ctx[11]);

    	function checkbox_value_binding(value) {
    		/*checkbox_value_binding*/ ctx[12](value);
    	}

    	function checkbox_checked_binding(value) {
    		/*checkbox_checked_binding*/ ctx[13](value);
    	}

    	let checkbox_props = { label: "Testing mode" };

    	if (/*testingMode*/ ctx[3] !== void 0) {
    		checkbox_props.value = /*testingMode*/ ctx[3];
    	}

    	if (/*testingMode*/ ctx[3] !== void 0) {
    		checkbox_props.checked = /*testingMode*/ ctx[3];
    	}

    	checkbox = new Checkbox({ props: checkbox_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox, 'value', checkbox_value_binding));
    	binding_callbacks.push(() => bind(checkbox, 'checked', checkbox_checked_binding));
    	checkbox.$on("change", /*change_handler_2*/ ctx[14]);

    	const block = {
    		c: function create() {
    			div9 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			h50 = element("h5");
    			h50.textContent = "File name";
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			create_component(input.$$.fragment);
    			t2 = space();
    			div7 = element("div");
    			div4 = element("div");
    			h51 = element("h5");
    			h51.textContent = "File type";
    			t4 = space();
    			div6 = element("div");
    			div5 = element("div");
    			create_component(selectmenu.$$.fragment);
    			t5 = space();
    			div8 = element("div");
    			create_component(checkbox.$$.fragment);
    			attr_dev(h50, "class", "m-0 text-xs");
    			add_location(h50, file$8, 36, 6, 1055);
    			attr_dev(div0, "class", "flex justify-between items-center text-[10px] mt-2 mb-2.5");
    			add_location(div0, file$8, 35, 4, 977);
    			attr_dev(div1, "class", "w-full");
    			add_location(div1, file$8, 39, 6, 1139);
    			attr_dev(div2, "class", "input-row svelte-1vju4z");
    			add_location(div2, file$8, 38, 4, 1109);
    			add_location(div3, file$8, 34, 2, 967);
    			attr_dev(h51, "class", "m-0 text-xs");
    			add_location(h51, file$8, 47, 6, 1386);
    			attr_dev(div4, "class", "flex justify-between items-center text-[10px] mt-2 mb-2.5");
    			add_location(div4, file$8, 46, 4, 1308);
    			attr_dev(div5, "class", "w-full");
    			add_location(div5, file$8, 50, 6, 1470);
    			attr_dev(div6, "class", "input-row svelte-1vju4z");
    			add_location(div6, file$8, 49, 4, 1440);
    			add_location(div7, file$8, 45, 2, 1298);
    			attr_dev(div8, "class", "mt-2");
    			add_location(div8, file$8, 56, 2, 1630);
    			attr_dev(div9, "class", "w-full flex flex-col gap-2");
    			add_location(div9, file$8, 33, 0, 924);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h50);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			mount_component(input, div1, null);
    			append_dev(div9, t2);
    			append_dev(div9, div7);
    			append_dev(div7, div4);
    			append_dev(div4, h51);
    			append_dev(div7, t4);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			mount_component(selectmenu, div5, null);
    			append_dev(div9, t5);
    			append_dev(div9, div8);
    			mount_component(checkbox, div8, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const input_changes = {};
    			if (dirty & /*syntax*/ 4) input_changes.placeholder = /*syntax*/ ctx[2];

    			if (!updating_value && dirty & /*syntax*/ 4) {
    				updating_value = true;
    				input_changes.value = /*syntax*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    			const selectmenu_changes = {};

    			if (!updating_menuItems && dirty & /*menuItems*/ 2) {
    				updating_menuItems = true;
    				selectmenu_changes.menuItems = /*menuItems*/ ctx[1];
    				add_flush_callback(() => updating_menuItems = false);
    			}

    			if (!updating_value_1 && dirty & /*fileType*/ 1) {
    				updating_value_1 = true;
    				selectmenu_changes.value = /*fileType*/ ctx[0];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			selectmenu.$set(selectmenu_changes);
    			const checkbox_changes = {};

    			if (!updating_value_2 && dirty & /*testingMode*/ 8) {
    				updating_value_2 = true;
    				checkbox_changes.value = /*testingMode*/ ctx[3];
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			if (!updating_checked && dirty & /*testingMode*/ 8) {
    				updating_checked = true;
    				checkbox_changes.checked = /*testingMode*/ ctx[3];
    				add_flush_callback(() => updating_checked = false);
    			}

    			checkbox.$set(checkbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			transition_in(selectmenu.$$.fragment, local);
    			transition_in(checkbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input.$$.fragment, local);
    			transition_out(selectmenu.$$.fragment, local);
    			transition_out(checkbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div9);
    			destroy_component(input);
    			destroy_component(selectmenu);
    			destroy_component(checkbox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('File', slots, []);
    	const dispatch = createEventDispatcher();
    	let { fileType = undefined } = $$props;
    	let { menuItems = [] } = $$props;
    	let { syntax = undefined } = $$props;
    	let { testingMode = false } = $$props;
    	let { errorMessage = "" } = $$props;

    	const validateFileName = fileName => {
    		if (fileName === "") {
    			$$invalidate(6, errorMessage = "File name cannot be empty");
    			dispatch("sendError");
    			return;
    		}

    		// if (fileName.includes("/")) {
    		//   errorMessage = "File name cannot contain '/'";
    		//   dispatch("sendError");
    		//   return;
    		// }
    		$$invalidate(2, syntax = slugify(fileName, {
    			lower: true,
    			strict: true,
    			remove: /[*+~.()'"!:@]/g
    		}));

    		dispatch("changeConfig");
    		return;
    	};

    	const writable_props = ['fileType', 'menuItems', 'syntax', 'testingMode', 'errorMessage'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<File> was created with unknown prop '${key}'`);
    	});

    	function input_value_binding(value) {
    		syntax = value;
    		$$invalidate(2, syntax);
    	}

    	const change_handler = () => validateFileName(syntax);

    	function selectmenu_menuItems_binding(value) {
    		menuItems = value;
    		$$invalidate(1, menuItems);
    	}

    	function selectmenu_value_binding(value) {
    		fileType = value;
    		$$invalidate(0, fileType);
    	}

    	const change_handler_1 = () => dispatch("changeConfig");

    	function checkbox_value_binding(value) {
    		testingMode = value;
    		$$invalidate(3, testingMode);
    	}

    	function checkbox_checked_binding(value) {
    		testingMode = value;
    		$$invalidate(3, testingMode);
    	}

    	const change_handler_2 = () => dispatch("changeConfig");

    	$$self.$$set = $$props => {
    		if ('fileType' in $$props) $$invalidate(0, fileType = $$props.fileType);
    		if ('menuItems' in $$props) $$invalidate(1, menuItems = $$props.menuItems);
    		if ('syntax' in $$props) $$invalidate(2, syntax = $$props.syntax);
    		if ('testingMode' in $$props) $$invalidate(3, testingMode = $$props.testingMode);
    		if ('errorMessage' in $$props) $$invalidate(6, errorMessage = $$props.errorMessage);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		slugify,
    		Checkbox,
    		Input,
    		SelectMenu,
    		dispatch,
    		fileType,
    		menuItems,
    		syntax,
    		testingMode,
    		errorMessage,
    		validateFileName
    	});

    	$$self.$inject_state = $$props => {
    		if ('fileType' in $$props) $$invalidate(0, fileType = $$props.fileType);
    		if ('menuItems' in $$props) $$invalidate(1, menuItems = $$props.menuItems);
    		if ('syntax' in $$props) $$invalidate(2, syntax = $$props.syntax);
    		if ('testingMode' in $$props) $$invalidate(3, testingMode = $$props.testingMode);
    		if ('errorMessage' in $$props) $$invalidate(6, errorMessage = $$props.errorMessage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		fileType,
    		menuItems,
    		syntax,
    		testingMode,
    		dispatch,
    		validateFileName,
    		errorMessage,
    		input_value_binding,
    		change_handler,
    		selectmenu_menuItems_binding,
    		selectmenu_value_binding,
    		change_handler_1,
    		checkbox_value_binding,
    		checkbox_checked_binding,
    		change_handler_2
    	];
    }

    class File extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			fileType: 0,
    			menuItems: 1,
    			syntax: 2,
    			testingMode: 3,
    			errorMessage: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "File",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get fileType() {
    		throw new Error("<File>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fileType(value) {
    		throw new Error("<File>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get menuItems() {
    		throw new Error("<File>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set menuItems(value) {
    		throw new Error("<File>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get syntax() {
    		throw new Error("<File>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set syntax(value) {
    		throw new Error("<File>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get testingMode() {
    		throw new Error("<File>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set testingMode(value) {
    		throw new Error("<File>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get errorMessage() {
    		throw new Error("<File>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errorMessage(value) {
    		throw new Error("<File>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$5 = ".textarea.svelte-vsapop{position:relative}textarea.svelte-vsapop{align-items:center;background-color:var(--figma-color-bg);border:1px solid var(--figma-color-border);border-radius:var(--border-radius-small);color:var(--figma-color-text);display:flex;font-family:var(--font-stack);font-size:var(--font-size-xsmall);font-weight:var(--font-weight-normal);letter-spacing:var(--font-letter-spacing-neg-xsmall);line-height:var(--line-height);margin:1px 0;min-height:62px;outline:none;overflow:visible;overflow-y:auto;padding:7px 4px 9px 7px;position:relative;resize:none;width:100%}textarea.svelte-vsapop:-moz-placeholder-shown:hover{background-image:none;border:1px solid var(--figma-color-border);color:var(--figma-color-text)}textarea.svelte-vsapop:hover,textarea.svelte-vsapop:placeholder-shown:hover{background-image:none;border:1px solid var(--figma-color-border);color:var(--figma-color-text)}textarea.svelte-vsapop::-moz-selection{background-color:var(--text-highlight);color:var(--figma-color-text)}textarea.svelte-vsapop::selection{background-color:var(--text-highlight);color:var(--figma-color-text)}textarea.svelte-vsapop::-moz-placeholder{border:1px solid transparent;color:var(--figma-color-text-tertiary)}textarea.svelte-vsapop::placeholder{border:1px solid transparent;color:var(--figma-color-text-tertiary)}textarea.svelte-vsapop:focus:-moz-placeholder-shown{border:1px solid var(--figma-color-border-selected);outline:1px solid var(--figma-color-border-selected);outline-offset:-2px}textarea.svelte-vsapop:focus:placeholder-shown{border:1px solid var(--figma-color-border-selected);outline:1px solid var(--figma-color-border-selected);outline-offset:-2px}textarea.svelte-vsapop:active,textarea.svelte-vsapop:focus{border:1px solid var(--figma-color-border-selected);color:var(--figma-color-text);outline:1px solid var(--figma-color-border-selected);outline-offset:-2px;padding:7px 4px 9px 7px}textarea.svelte-vsapop:disabled,textarea.svelte-vsapop:disabled:hover{border:1px solid transparent;color:var(--figma-color-text-disabled);position:relative}textarea.svelte-vsapop:disabled:active{outline:none;padding:7px 4px 9px 7px}";
    styleInject(css_248z$5);

    /* src/lib/components/Inputs/TextArea.svelte generated by Svelte v3.48.0 */

    const file$7 = "src/lib/components/Inputs/TextArea.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let textarea;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			textarea = element("textarea");
    			attr_dev(textarea, "type", "input");
    			attr_dev(textarea, "id", /*id*/ ctx[1]);
    			attr_dev(textarea, "name", /*name*/ ctx[3]);
    			attr_dev(textarea, "rows", /*rows*/ ctx[2]);
    			textarea.disabled = /*disabled*/ ctx[4];
    			attr_dev(textarea, "placeholder", /*placeholder*/ ctx[5]);
    			attr_dev(textarea, "class", "svelte-vsapop");
    			add_location(textarea, file$7, 13, 2, 298);
    			attr_dev(div, "class", div_class_value = "textarea " + /*className*/ ctx[6] + " svelte-vsapop");
    			add_location(div, file$7, 12, 0, 261);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, textarea);
    			set_input_value(textarea, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", /*input_handler*/ ctx[7], false, false, false),
    					listen_dev(textarea, "change", /*change_handler*/ ctx[8], false, false, false),
    					listen_dev(textarea, "keydown", /*keydown_handler*/ ctx[9], false, false, false),
    					listen_dev(textarea, "focus", /*focus_handler*/ ctx[10], false, false, false),
    					listen_dev(textarea, "blur", /*blur_handler*/ ctx[11], false, false, false),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[12])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*id*/ 2) {
    				attr_dev(textarea, "id", /*id*/ ctx[1]);
    			}

    			if (dirty & /*name*/ 8) {
    				attr_dev(textarea, "name", /*name*/ ctx[3]);
    			}

    			if (dirty & /*rows*/ 4) {
    				attr_dev(textarea, "rows", /*rows*/ ctx[2]);
    			}

    			if (dirty & /*disabled*/ 16) {
    				prop_dev(textarea, "disabled", /*disabled*/ ctx[4]);
    			}

    			if (dirty & /*placeholder*/ 32) {
    				attr_dev(textarea, "placeholder", /*placeholder*/ ctx[5]);
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(textarea, /*value*/ ctx[0]);
    			}

    			if (dirty & /*className*/ 64 && div_class_value !== (div_class_value = "textarea " + /*className*/ ctx[6] + " svelte-vsapop")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TextArea', slots, []);
    	let { id = null } = $$props;
    	let { value = null } = $$props;
    	let { rows = 2 } = $$props;
    	let { name = null } = $$props;
    	let { disabled = false } = $$props;
    	let { placeholder = "Input something here..." } = $$props;
    	let { class: className = "" } = $$props;
    	const writable_props = ['id', 'value', 'rows', 'name', 'disabled', 'placeholder', 'class'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TextArea> was created with unknown prop '${key}'`);
    	});

    	function input_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function focus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function textarea_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('rows' in $$props) $$invalidate(2, rows = $$props.rows);
    		if ('name' in $$props) $$invalidate(3, name = $$props.name);
    		if ('disabled' in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ('placeholder' in $$props) $$invalidate(5, placeholder = $$props.placeholder);
    		if ('class' in $$props) $$invalidate(6, className = $$props.class);
    	};

    	$$self.$capture_state = () => ({
    		id,
    		value,
    		rows,
    		name,
    		disabled,
    		placeholder,
    		className
    	});

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('rows' in $$props) $$invalidate(2, rows = $$props.rows);
    		if ('name' in $$props) $$invalidate(3, name = $$props.name);
    		if ('disabled' in $$props) $$invalidate(4, disabled = $$props.disabled);
    		if ('placeholder' in $$props) $$invalidate(5, placeholder = $$props.placeholder);
    		if ('className' in $$props) $$invalidate(6, className = $$props.className);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		id,
    		rows,
    		name,
    		disabled,
    		placeholder,
    		className,
    		input_handler,
    		change_handler,
    		keydown_handler,
    		focus_handler,
    		blur_handler,
    		textarea_input_handler
    	];
    }

    class TextArea extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			id: 1,
    			value: 0,
    			rows: 2,
    			name: 3,
    			disabled: 4,
    			placeholder: 5,
    			class: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextArea",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get id() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rows() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rows(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get class() {
    		throw new Error("<TextArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<TextArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$4 = ".input-row.svelte-r35kvp{display:flex;justify-content:flex-start;width:100%}.disabled.svelte-r35kvp{cursor:not-allowed;opacity:.5;pointer-events:none}";
    styleInject(css_248z$4);

    /* src/lib/components/Controls/Images.svelte generated by Svelte v3.48.0 */

    const { console: console_1$1 } = globals;
    const file$6 = "src/lib/components/Controls/Images.svelte";

    function create_fragment$6(ctx) {
    	let div17;
    	let div8;
    	let div3;
    	let div0;
    	let h50;
    	let t1;
    	let div2;
    	let div1;
    	let selectmenu0;
    	let updating_value;
    	let t2;
    	let div7;
    	let div4;
    	let h51;
    	let t4;
    	let div6;
    	let div5;
    	let selectmenu1;
    	let updating_value_1;
    	let t5;
    	let div12;
    	let div9;
    	let h52;
    	let t7;
    	let div11;
    	let div10;
    	let input;
    	let updating_value_2;
    	let t8;
    	let div16;
    	let div13;
    	let h53;
    	let t10;
    	let div15;
    	let div14;
    	let textarea;
    	let updating_value_3;
    	let current;

    	function selectmenu0_value_binding(value) {
    		/*selectmenu0_value_binding*/ ctx[7](value);
    	}

    	let selectmenu0_props = {
    		menuItems: /*scaleOptions*/ ctx[5],
    		disabled: /*extension*/ ctx[1].value === "SVG"
    	};

    	if (/*scale*/ ctx[3] !== void 0) {
    		selectmenu0_props.value = /*scale*/ ctx[3];
    	}

    	selectmenu0 = new SelectMenu({ props: selectmenu0_props, $$inline: true });
    	binding_callbacks.push(() => bind(selectmenu0, 'value', selectmenu0_value_binding));
    	selectmenu0.$on("change", /*change_handler*/ ctx[8]);

    	function selectmenu1_value_binding(value) {
    		/*selectmenu1_value_binding*/ ctx[9](value);
    	}

    	let selectmenu1_props = { menuItems: /*extensionOptions*/ ctx[4] };

    	if (/*extension*/ ctx[1] !== void 0) {
    		selectmenu1_props.value = /*extension*/ ctx[1];
    	}

    	selectmenu1 = new SelectMenu({ props: selectmenu1_props, $$inline: true });
    	binding_callbacks.push(() => bind(selectmenu1, 'value', selectmenu1_value_binding));
    	selectmenu1.$on("change", /*change_handler_1*/ ctx[10]);

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[11](value);
    	}

    	let input_props = {
    		placeholder: "Enter an image path to include in your export."
    	};

    	if (/*imagePath*/ ctx[2] !== void 0) {
    		input_props.value = /*imagePath*/ ctx[2];
    	}

    	input = new Input({ props: input_props, $$inline: true });
    	binding_callbacks.push(() => bind(input, 'value', input_value_binding));
    	input.$on("change", /*change_handler_2*/ ctx[12]);

    	function textarea_value_binding(value) {
    		/*textarea_value_binding*/ ctx[13](value);
    	}

    	let textarea_props = {
    		placeholder: "Enter alternate text to apply to your images."
    	};

    	if (/*altText*/ ctx[0] !== void 0) {
    		textarea_props.value = /*altText*/ ctx[0];
    	}

    	textarea = new TextArea({ props: textarea_props, $$inline: true });
    	binding_callbacks.push(() => bind(textarea, 'value', textarea_value_binding));
    	textarea.$on("change", /*change_handler_3*/ ctx[14]);

    	const block = {
    		c: function create() {
    			div17 = element("div");
    			div8 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			h50 = element("h5");
    			h50.textContent = "Scale";
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			create_component(selectmenu0.$$.fragment);
    			t2 = space();
    			div7 = element("div");
    			div4 = element("div");
    			h51 = element("h5");
    			h51.textContent = "Format";
    			t4 = space();
    			div6 = element("div");
    			div5 = element("div");
    			create_component(selectmenu1.$$.fragment);
    			t5 = space();
    			div12 = element("div");
    			div9 = element("div");
    			h52 = element("h5");
    			h52.textContent = "Path";
    			t7 = space();
    			div11 = element("div");
    			div10 = element("div");
    			create_component(input.$$.fragment);
    			t8 = space();
    			div16 = element("div");
    			div13 = element("div");
    			h53 = element("h5");
    			h53.textContent = "Alt text";
    			t10 = space();
    			div15 = element("div");
    			div14 = element("div");
    			create_component(textarea.$$.fragment);
    			attr_dev(h50, "class", "m-0 text-xs");
    			add_location(h50, file$6, 21, 8, 659);
    			attr_dev(div0, "class", "flex justify-between items-center text-[10px] mt-2 mb-2.5");
    			add_location(div0, file$6, 20, 6, 579);
    			attr_dev(div1, "class", "w-full svelte-r35kvp");
    			toggle_class(div1, "disabled", /*extension*/ ctx[1].value === "SVG");
    			add_location(div1, file$6, 24, 8, 745);
    			attr_dev(div2, "class", "input-row svelte-r35kvp");
    			add_location(div2, file$6, 23, 6, 713);
    			attr_dev(div3, "class", "flex-grow");
    			add_location(div3, file$6, 19, 4, 549);
    			attr_dev(h51, "class", "m-0 text-xs");
    			add_location(h51, file$6, 36, 8, 1169);
    			attr_dev(div4, "class", "flex justify-between items-center text-[10px] mt-2 mb-2.5");
    			add_location(div4, file$6, 35, 6, 1089);
    			attr_dev(div5, "class", "w-full");
    			add_location(div5, file$6, 39, 8, 1256);
    			attr_dev(div6, "class", "input-row svelte-r35kvp");
    			add_location(div6, file$6, 38, 6, 1224);
    			attr_dev(div7, "class", "flex-grow");
    			add_location(div7, file$6, 34, 4, 1059);
    			attr_dev(div8, "class", "flex gap-2");
    			add_location(div8, file$6, 18, 2, 520);
    			attr_dev(h52, "class", "m-0 text-xs");
    			add_location(h52, file$6, 48, 6, 1536);
    			attr_dev(div9, "class", "flex justify-between items-center text-[10px] mt-2 mb-2.5");
    			add_location(div9, file$6, 47, 4, 1458);
    			attr_dev(div10, "class", "w-full");
    			add_location(div10, file$6, 51, 6, 1615);
    			attr_dev(div11, "class", "input-row svelte-r35kvp");
    			add_location(div11, file$6, 50, 4, 1585);
    			add_location(div12, file$6, 46, 2, 1448);
    			attr_dev(h53, "class", "m-0 text-xs");
    			add_location(h53, file$6, 63, 6, 1943);
    			attr_dev(div13, "class", "flex justify-between items-center text-[10px] mt-2 mb-2.5");
    			add_location(div13, file$6, 62, 4, 1865);
    			attr_dev(div14, "class", "w-full");
    			add_location(div14, file$6, 66, 6, 2026);
    			attr_dev(div15, "class", "input-row svelte-r35kvp");
    			add_location(div15, file$6, 65, 4, 1996);
    			add_location(div16, file$6, 61, 2, 1855);
    			attr_dev(div17, "class", "w-full flex flex-col gap-2");
    			add_location(div17, file$6, 17, 0, 477);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div17, anchor);
    			append_dev(div17, div8);
    			append_dev(div8, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h50);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			mount_component(selectmenu0, div1, null);
    			append_dev(div8, t2);
    			append_dev(div8, div7);
    			append_dev(div7, div4);
    			append_dev(div4, h51);
    			append_dev(div7, t4);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			mount_component(selectmenu1, div5, null);
    			append_dev(div17, t5);
    			append_dev(div17, div12);
    			append_dev(div12, div9);
    			append_dev(div9, h52);
    			append_dev(div12, t7);
    			append_dev(div12, div11);
    			append_dev(div11, div10);
    			mount_component(input, div10, null);
    			append_dev(div17, t8);
    			append_dev(div17, div16);
    			append_dev(div16, div13);
    			append_dev(div13, h53);
    			append_dev(div16, t10);
    			append_dev(div16, div15);
    			append_dev(div15, div14);
    			mount_component(textarea, div14, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const selectmenu0_changes = {};
    			if (dirty & /*scaleOptions*/ 32) selectmenu0_changes.menuItems = /*scaleOptions*/ ctx[5];
    			if (dirty & /*extension*/ 2) selectmenu0_changes.disabled = /*extension*/ ctx[1].value === "SVG";

    			if (!updating_value && dirty & /*scale*/ 8) {
    				updating_value = true;
    				selectmenu0_changes.value = /*scale*/ ctx[3];
    				add_flush_callback(() => updating_value = false);
    			}

    			selectmenu0.$set(selectmenu0_changes);

    			if (dirty & /*extension*/ 2) {
    				toggle_class(div1, "disabled", /*extension*/ ctx[1].value === "SVG");
    			}

    			const selectmenu1_changes = {};
    			if (dirty & /*extensionOptions*/ 16) selectmenu1_changes.menuItems = /*extensionOptions*/ ctx[4];

    			if (!updating_value_1 && dirty & /*extension*/ 2) {
    				updating_value_1 = true;
    				selectmenu1_changes.value = /*extension*/ ctx[1];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			selectmenu1.$set(selectmenu1_changes);
    			const input_changes = {};

    			if (!updating_value_2 && dirty & /*imagePath*/ 4) {
    				updating_value_2 = true;
    				input_changes.value = /*imagePath*/ ctx[2];
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			input.$set(input_changes);
    			const textarea_changes = {};

    			if (!updating_value_3 && dirty & /*altText*/ 1) {
    				updating_value_3 = true;
    				textarea_changes.value = /*altText*/ ctx[0];
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			textarea.$set(textarea_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectmenu0.$$.fragment, local);
    			transition_in(selectmenu1.$$.fragment, local);
    			transition_in(input.$$.fragment, local);
    			transition_in(textarea.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(selectmenu0.$$.fragment, local);
    			transition_out(selectmenu1.$$.fragment, local);
    			transition_out(input.$$.fragment, local);
    			transition_out(textarea.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div17);
    			destroy_component(selectmenu0);
    			destroy_component(selectmenu1);
    			destroy_component(input);
    			destroy_component(textarea);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Images', slots, []);
    	const dispatch = createEventDispatcher();
    	let { altText = undefined } = $$props;
    	let { extension = undefined } = $$props;
    	let { extensionOptions = [] } = $$props;
    	let { imagePath = undefined } = $$props;
    	let { scale = undefined } = $$props;
    	let { scaleOptions = [] } = $$props;

    	const writable_props = [
    		'altText',
    		'extension',
    		'extensionOptions',
    		'imagePath',
    		'scale',
    		'scaleOptions'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Images> was created with unknown prop '${key}'`);
    	});

    	function selectmenu0_value_binding(value) {
    		scale = value;
    		$$invalidate(3, scale);
    	}

    	const change_handler = () => dispatch("changeConfig");

    	function selectmenu1_value_binding(value) {
    		extension = value;
    		$$invalidate(1, extension);
    	}

    	const change_handler_1 = () => dispatch("changeConfig");

    	function input_value_binding(value) {
    		imagePath = value;
    		$$invalidate(2, imagePath);
    	}

    	const change_handler_2 = () => dispatch("changeConfig");

    	function textarea_value_binding(value) {
    		altText = value;
    		$$invalidate(0, altText);
    	}

    	const change_handler_3 = () => {
    		console.log("here");
    		dispatch("changeConfig");
    	};

    	$$self.$$set = $$props => {
    		if ('altText' in $$props) $$invalidate(0, altText = $$props.altText);
    		if ('extension' in $$props) $$invalidate(1, extension = $$props.extension);
    		if ('extensionOptions' in $$props) $$invalidate(4, extensionOptions = $$props.extensionOptions);
    		if ('imagePath' in $$props) $$invalidate(2, imagePath = $$props.imagePath);
    		if ('scale' in $$props) $$invalidate(3, scale = $$props.scale);
    		if ('scaleOptions' in $$props) $$invalidate(5, scaleOptions = $$props.scaleOptions);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Input,
    		SelectMenu,
    		TextArea,
    		dispatch,
    		altText,
    		extension,
    		extensionOptions,
    		imagePath,
    		scale,
    		scaleOptions
    	});

    	$$self.$inject_state = $$props => {
    		if ('altText' in $$props) $$invalidate(0, altText = $$props.altText);
    		if ('extension' in $$props) $$invalidate(1, extension = $$props.extension);
    		if ('extensionOptions' in $$props) $$invalidate(4, extensionOptions = $$props.extensionOptions);
    		if ('imagePath' in $$props) $$invalidate(2, imagePath = $$props.imagePath);
    		if ('scale' in $$props) $$invalidate(3, scale = $$props.scale);
    		if ('scaleOptions' in $$props) $$invalidate(5, scaleOptions = $$props.scaleOptions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		altText,
    		extension,
    		imagePath,
    		scale,
    		extensionOptions,
    		scaleOptions,
    		dispatch,
    		selectmenu0_value_binding,
    		change_handler,
    		selectmenu1_value_binding,
    		change_handler_1,
    		input_value_binding,
    		change_handler_2,
    		textarea_value_binding,
    		change_handler_3
    	];
    }

    class Images extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			altText: 0,
    			extension: 1,
    			extensionOptions: 4,
    			imagePath: 2,
    			scale: 3,
    			scaleOptions: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Images",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get altText() {
    		throw new Error("<Images>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set altText(value) {
    		throw new Error("<Images>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get extension() {
    		throw new Error("<Images>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set extension(value) {
    		throw new Error("<Images>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get extensionOptions() {
    		throw new Error("<Images>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set extensionOptions(value) {
    		throw new Error("<Images>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get imagePath() {
    		throw new Error("<Images>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set imagePath(value) {
    		throw new Error("<Images>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scale() {
    		throw new Error("<Images>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scale(value) {
    		throw new Error("<Images>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scaleOptions() {
    		throw new Error("<Images>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scaleOptions(value) {
    		throw new Error("<Images>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$3 = ".input-row.svelte-1vju4z{display:flex;justify-content:flex-start;width:100%}";
    styleInject(css_248z$3);

    /* src/lib/components/Controls/Page.svelte generated by Svelte v3.48.0 */

    const { console: console_1 } = globals;
    const file$5 = "src/lib/components/Controls/Page.svelte";

    function create_fragment$5(ctx) {
    	let div13;
    	let checkbox0;
    	let updating_value;
    	let updating_checked;
    	let t0;
    	let checkbox1;
    	let updating_value_1;
    	let updating_checked_1;
    	let t1;
    	let checkbox2;
    	let updating_value_2;
    	let updating_checked_2;
    	let t2;
    	let div4;
    	let div3;
    	let div0;
    	let h50;
    	let t4;
    	let div2;
    	let div1;
    	let input0;
    	let updating_value_3;
    	let t5;
    	let div8;
    	let div5;
    	let h51;
    	let t7;
    	let div7;
    	let div6;
    	let input1;
    	let updating_value_4;
    	let t8;
    	let div12;
    	let div9;
    	let h52;
    	let t10;
    	let div11;
    	let div10;
    	let textarea;
    	let updating_value_5;
    	let current;

    	function checkbox0_value_binding(value) {
    		/*checkbox0_value_binding*/ ctx[7](value);
    	}

    	function checkbox0_checked_binding(value) {
    		/*checkbox0_checked_binding*/ ctx[8](value);
    	}

    	let checkbox0_props = { label: "Include resizer script" };

    	if (/*includeResizer*/ ctx[4] !== void 0) {
    		checkbox0_props.value = /*includeResizer*/ ctx[4];
    	}

    	if (/*includeResizer*/ ctx[4] !== void 0) {
    		checkbox0_props.checked = /*includeResizer*/ ctx[4];
    	}

    	checkbox0 = new Checkbox({ props: checkbox0_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox0, 'value', checkbox0_value_binding));
    	binding_callbacks.push(() => bind(checkbox0, 'checked', checkbox0_checked_binding));
    	checkbox0.$on("change", /*change_handler*/ ctx[9]);

    	function checkbox1_value_binding(value) {
    		/*checkbox1_value_binding*/ ctx[10](value);
    	}

    	function checkbox1_checked_binding(value) {
    		/*checkbox1_checked_binding*/ ctx[11](value);
    	}

    	let checkbox1_props = { label: "Center HTML output" };

    	if (/*centerHtmlOutput*/ ctx[1] !== void 0) {
    		checkbox1_props.value = /*centerHtmlOutput*/ ctx[1];
    	}

    	if (/*centerHtmlOutput*/ ctx[1] !== void 0) {
    		checkbox1_props.checked = /*centerHtmlOutput*/ ctx[1];
    	}

    	checkbox1 = new Checkbox({ props: checkbox1_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox1, 'value', checkbox1_value_binding));
    	binding_callbacks.push(() => bind(checkbox1, 'checked', checkbox1_checked_binding));
    	checkbox1.$on("change", /*change_handler_1*/ ctx[12]);

    	function checkbox2_value_binding(value) {
    		/*checkbox2_value_binding*/ ctx[13](value);
    	}

    	function checkbox2_checked_binding(value) {
    		/*checkbox2_checked_binding*/ ctx[14](value);
    	}

    	let checkbox2_props = { label: "Fluid container width" };

    	if (/*fluid*/ ctx[3] !== void 0) {
    		checkbox2_props.value = /*fluid*/ ctx[3];
    	}

    	if (/*fluid*/ ctx[3] !== void 0) {
    		checkbox2_props.checked = /*fluid*/ ctx[3];
    	}

    	checkbox2 = new Checkbox({ props: checkbox2_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox2, 'value', checkbox2_value_binding));
    	binding_callbacks.push(() => bind(checkbox2, 'checked', checkbox2_checked_binding));
    	checkbox2.$on("change", /*change_handler_2*/ ctx[15]);

    	function input0_value_binding(value) {
    		/*input0_value_binding*/ ctx[16](value);
    	}

    	let input0_props = {
    		placeholder: "Enter a max width for the images."
    	};

    	if (/*maxWidth*/ ctx[5] !== void 0) {
    		input0_props.value = /*maxWidth*/ ctx[5];
    	}

    	input0 = new Input({ props: input0_props, $$inline: true });
    	binding_callbacks.push(() => bind(input0, 'value', input0_value_binding));
    	input0.$on("change", /*change_handler_3*/ ctx[17]);

    	function input1_value_binding(value) {
    		/*input1_value_binding*/ ctx[18](value);
    	}

    	let input1_props = {
    		placeholder: "Enter a link to apply to the full image."
    	};

    	if (/*clickableLink*/ ctx[2] !== void 0) {
    		input1_props.value = /*clickableLink*/ ctx[2];
    	}

    	input1 = new Input({ props: input1_props, $$inline: true });
    	binding_callbacks.push(() => bind(input1, 'value', input1_value_binding));
    	input1.$on("change", /*change_handler_4*/ ctx[19]);

    	function textarea_value_binding(value) {
    		/*textarea_value_binding*/ ctx[20](value);
    	}

    	let textarea_props = {
    		placeholder: "Enter a custom script to be included in the exported HTML file here."
    	};

    	if (/*customScript*/ ctx[0] !== void 0) {
    		textarea_props.value = /*customScript*/ ctx[0];
    	}

    	textarea = new TextArea({ props: textarea_props, $$inline: true });
    	binding_callbacks.push(() => bind(textarea, 'value', textarea_value_binding));
    	textarea.$on("change", /*change_handler_5*/ ctx[21]);

    	const block = {
    		c: function create() {
    			div13 = element("div");
    			create_component(checkbox0.$$.fragment);
    			t0 = space();
    			create_component(checkbox1.$$.fragment);
    			t1 = space();
    			create_component(checkbox2.$$.fragment);
    			t2 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			h50 = element("h5");
    			h50.textContent = "Add max width (px)";
    			t4 = space();
    			div2 = element("div");
    			div1 = element("div");
    			create_component(input0.$$.fragment);
    			t5 = space();
    			div8 = element("div");
    			div5 = element("div");
    			h51 = element("h5");
    			h51.textContent = "Clickable link";
    			t7 = space();
    			div7 = element("div");
    			div6 = element("div");
    			create_component(input1.$$.fragment);
    			t8 = space();
    			div12 = element("div");
    			div9 = element("div");
    			h52 = element("h5");
    			h52.textContent = "Custom script";
    			t10 = space();
    			div11 = element("div");
    			div10 = element("div");
    			create_component(textarea.$$.fragment);
    			attr_dev(h50, "class", "m-0 text-xs");
    			add_location(h50, file$5, 42, 8, 1177);
    			attr_dev(div0, "class", "flex justify-between items-center text-[10px] mt-2 mb-2.5");
    			add_location(div0, file$5, 41, 6, 1097);
    			attr_dev(div1, "class", "w-full");
    			add_location(div1, file$5, 45, 8, 1276);
    			attr_dev(div2, "class", "input-row svelte-1vju4z");
    			add_location(div2, file$5, 44, 6, 1244);
    			attr_dev(div3, "class", "flex-grow");
    			add_location(div3, file$5, 40, 4, 1067);
    			attr_dev(div4, "class", "flex gap-2");
    			add_location(div4, file$5, 39, 2, 1038);
    			attr_dev(h51, "class", "m-0 text-xs");
    			add_location(h51, file$5, 58, 6, 1615);
    			attr_dev(div5, "class", "flex justify-between items-center text-[10px] mt-2 mb-2.5");
    			add_location(div5, file$5, 57, 4, 1537);
    			attr_dev(div6, "class", "w-full");
    			add_location(div6, file$5, 61, 6, 1704);
    			attr_dev(div7, "class", "input-row svelte-1vju4z");
    			add_location(div7, file$5, 60, 4, 1674);
    			add_location(div8, file$5, 56, 2, 1527);
    			attr_dev(h52, "class", "m-0 text-xs");
    			add_location(h52, file$5, 73, 6, 2030);
    			attr_dev(div9, "class", "flex justify-between items-center text-[10px] mt-2 mb-2.5");
    			add_location(div9, file$5, 72, 4, 1952);
    			attr_dev(div10, "class", "w-full");
    			add_location(div10, file$5, 76, 6, 2118);
    			attr_dev(div11, "class", "input-row svelte-1vju4z");
    			add_location(div11, file$5, 75, 4, 2088);
    			add_location(div12, file$5, 71, 2, 1942);
    			attr_dev(div13, "class", "w-full flex flex-col gap-2");
    			add_location(div13, file$5, 19, 0, 518);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div13, anchor);
    			mount_component(checkbox0, div13, null);
    			append_dev(div13, t0);
    			mount_component(checkbox1, div13, null);
    			append_dev(div13, t1);
    			mount_component(checkbox2, div13, null);
    			append_dev(div13, t2);
    			append_dev(div13, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h50);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			mount_component(input0, div1, null);
    			append_dev(div13, t5);
    			append_dev(div13, div8);
    			append_dev(div8, div5);
    			append_dev(div5, h51);
    			append_dev(div8, t7);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			mount_component(input1, div6, null);
    			append_dev(div13, t8);
    			append_dev(div13, div12);
    			append_dev(div12, div9);
    			append_dev(div9, h52);
    			append_dev(div12, t10);
    			append_dev(div12, div11);
    			append_dev(div11, div10);
    			mount_component(textarea, div10, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const checkbox0_changes = {};

    			if (!updating_value && dirty & /*includeResizer*/ 16) {
    				updating_value = true;
    				checkbox0_changes.value = /*includeResizer*/ ctx[4];
    				add_flush_callback(() => updating_value = false);
    			}

    			if (!updating_checked && dirty & /*includeResizer*/ 16) {
    				updating_checked = true;
    				checkbox0_changes.checked = /*includeResizer*/ ctx[4];
    				add_flush_callback(() => updating_checked = false);
    			}

    			checkbox0.$set(checkbox0_changes);
    			const checkbox1_changes = {};

    			if (!updating_value_1 && dirty & /*centerHtmlOutput*/ 2) {
    				updating_value_1 = true;
    				checkbox1_changes.value = /*centerHtmlOutput*/ ctx[1];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			if (!updating_checked_1 && dirty & /*centerHtmlOutput*/ 2) {
    				updating_checked_1 = true;
    				checkbox1_changes.checked = /*centerHtmlOutput*/ ctx[1];
    				add_flush_callback(() => updating_checked_1 = false);
    			}

    			checkbox1.$set(checkbox1_changes);
    			const checkbox2_changes = {};

    			if (!updating_value_2 && dirty & /*fluid*/ 8) {
    				updating_value_2 = true;
    				checkbox2_changes.value = /*fluid*/ ctx[3];
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			if (!updating_checked_2 && dirty & /*fluid*/ 8) {
    				updating_checked_2 = true;
    				checkbox2_changes.checked = /*fluid*/ ctx[3];
    				add_flush_callback(() => updating_checked_2 = false);
    			}

    			checkbox2.$set(checkbox2_changes);
    			const input0_changes = {};

    			if (!updating_value_3 && dirty & /*maxWidth*/ 32) {
    				updating_value_3 = true;
    				input0_changes.value = /*maxWidth*/ ctx[5];
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			input0.$set(input0_changes);
    			const input1_changes = {};

    			if (!updating_value_4 && dirty & /*clickableLink*/ 4) {
    				updating_value_4 = true;
    				input1_changes.value = /*clickableLink*/ ctx[2];
    				add_flush_callback(() => updating_value_4 = false);
    			}

    			input1.$set(input1_changes);
    			const textarea_changes = {};

    			if (!updating_value_5 && dirty & /*customScript*/ 1) {
    				updating_value_5 = true;
    				textarea_changes.value = /*customScript*/ ctx[0];
    				add_flush_callback(() => updating_value_5 = false);
    			}

    			textarea.$set(textarea_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkbox0.$$.fragment, local);
    			transition_in(checkbox1.$$.fragment, local);
    			transition_in(checkbox2.$$.fragment, local);
    			transition_in(input0.$$.fragment, local);
    			transition_in(input1.$$.fragment, local);
    			transition_in(textarea.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkbox0.$$.fragment, local);
    			transition_out(checkbox1.$$.fragment, local);
    			transition_out(checkbox2.$$.fragment, local);
    			transition_out(input0.$$.fragment, local);
    			transition_out(input1.$$.fragment, local);
    			transition_out(textarea.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div13);
    			destroy_component(checkbox0);
    			destroy_component(checkbox1);
    			destroy_component(checkbox2);
    			destroy_component(input0);
    			destroy_component(input1);
    			destroy_component(textarea);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Page', slots, []);
    	const dispatch = createEventDispatcher();
    	let { centerHtmlOutput = false } = $$props;
    	let { clickableLink = undefined } = $$props;
    	let { customScript = undefined } = $$props;
    	let { fluid = false } = $$props;
    	let { includeResizer = false } = $$props;
    	let { maxWidth = undefined } = $$props;

    	const writable_props = [
    		'centerHtmlOutput',
    		'clickableLink',
    		'customScript',
    		'fluid',
    		'includeResizer',
    		'maxWidth'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Page> was created with unknown prop '${key}'`);
    	});

    	function checkbox0_value_binding(value) {
    		includeResizer = value;
    		$$invalidate(4, includeResizer);
    	}

    	function checkbox0_checked_binding(value) {
    		includeResizer = value;
    		$$invalidate(4, includeResizer);
    	}

    	const change_handler = () => dispatch("changeConfig");

    	function checkbox1_value_binding(value) {
    		centerHtmlOutput = value;
    		$$invalidate(1, centerHtmlOutput);
    	}

    	function checkbox1_checked_binding(value) {
    		centerHtmlOutput = value;
    		$$invalidate(1, centerHtmlOutput);
    	}

    	const change_handler_1 = () => dispatch("changeConfig");

    	function checkbox2_value_binding(value) {
    		fluid = value;
    		$$invalidate(3, fluid);
    	}

    	function checkbox2_checked_binding(value) {
    		fluid = value;
    		$$invalidate(3, fluid);
    	}

    	const change_handler_2 = () => dispatch("changeConfig");

    	function input0_value_binding(value) {
    		maxWidth = value;
    		$$invalidate(5, maxWidth);
    	}

    	const change_handler_3 = () => dispatch("changeConfig");

    	function input1_value_binding(value) {
    		clickableLink = value;
    		$$invalidate(2, clickableLink);
    	}

    	const change_handler_4 = () => dispatch("changeConfig");

    	function textarea_value_binding(value) {
    		customScript = value;
    		$$invalidate(0, customScript);
    	}

    	const change_handler_5 = () => dispatch("changeConfig");

    	$$self.$$set = $$props => {
    		if ('centerHtmlOutput' in $$props) $$invalidate(1, centerHtmlOutput = $$props.centerHtmlOutput);
    		if ('clickableLink' in $$props) $$invalidate(2, clickableLink = $$props.clickableLink);
    		if ('customScript' in $$props) $$invalidate(0, customScript = $$props.customScript);
    		if ('fluid' in $$props) $$invalidate(3, fluid = $$props.fluid);
    		if ('includeResizer' in $$props) $$invalidate(4, includeResizer = $$props.includeResizer);
    		if ('maxWidth' in $$props) $$invalidate(5, maxWidth = $$props.maxWidth);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Checkbox,
    		Input,
    		TextArea,
    		dispatch,
    		centerHtmlOutput,
    		clickableLink,
    		customScript,
    		fluid,
    		includeResizer,
    		maxWidth
    	});

    	$$self.$inject_state = $$props => {
    		if ('centerHtmlOutput' in $$props) $$invalidate(1, centerHtmlOutput = $$props.centerHtmlOutput);
    		if ('clickableLink' in $$props) $$invalidate(2, clickableLink = $$props.clickableLink);
    		if ('customScript' in $$props) $$invalidate(0, customScript = $$props.customScript);
    		if ('fluid' in $$props) $$invalidate(3, fluid = $$props.fluid);
    		if ('includeResizer' in $$props) $$invalidate(4, includeResizer = $$props.includeResizer);
    		if ('maxWidth' in $$props) $$invalidate(5, maxWidth = $$props.maxWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*customScript*/ 1) {
    			console.log(customScript);
    		}
    	};

    	return [
    		customScript,
    		centerHtmlOutput,
    		clickableLink,
    		fluid,
    		includeResizer,
    		maxWidth,
    		dispatch,
    		checkbox0_value_binding,
    		checkbox0_checked_binding,
    		change_handler,
    		checkbox1_value_binding,
    		checkbox1_checked_binding,
    		change_handler_1,
    		checkbox2_value_binding,
    		checkbox2_checked_binding,
    		change_handler_2,
    		input0_value_binding,
    		change_handler_3,
    		input1_value_binding,
    		change_handler_4,
    		textarea_value_binding,
    		change_handler_5
    	];
    }

    class Page extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			centerHtmlOutput: 1,
    			clickableLink: 2,
    			customScript: 0,
    			fluid: 3,
    			includeResizer: 4,
    			maxWidth: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Page",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get centerHtmlOutput() {
    		throw new Error("<Page>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centerHtmlOutput(value) {
    		throw new Error("<Page>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clickableLink() {
    		throw new Error("<Page>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clickableLink(value) {
    		throw new Error("<Page>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get customScript() {
    		throw new Error("<Page>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set customScript(value) {
    		throw new Error("<Page>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fluid() {
    		throw new Error("<Page>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fluid(value) {
    		throw new Error("<Page>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get includeResizer() {
    		throw new Error("<Page>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set includeResizer(value) {
    		throw new Error("<Page>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxWidth() {
    		throw new Error("<Page>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxWidth(value) {
    		throw new Error("<Page>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$2 = ".container.svelte-19l6a0x{border:1px solid var(--figma-color-border);width:calc(50% - 16px)}";
    styleInject(css_248z$2);

    /* src/lib/components/Layout/PreviewCard.svelte generated by Svelte v3.48.0 */

    const file$4 = "src/lib/components/Layout/PreviewCard.svelte";

    // (21:4) {#if icon}
    function create_if_block_3(ctx) {
    	let i;
    	let i_class_value;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", i_class_value = "text-base fa-sharp fa-solid fa-" + /*icon*/ ctx[1] + " svelte-19l6a0x");
    			add_location(i, file$4, 21, 6, 568);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*icon*/ 2 && i_class_value !== (i_class_value = "text-base fa-sharp fa-solid fa-" + /*icon*/ ctx[1] + " svelte-19l6a0x")) {
    				attr_dev(i, "class", i_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(21:4) {#if icon}",
    		ctx
    	});

    	return block;
    }

    // (24:4) {#if src}
    function create_if_block_2$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "w-full h-full");
    			if (!src_url_equal(img.src, img_src_value = /*src*/ ctx[4])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "asset thumbnail");
    			add_location(img, file$4, 24, 6, 650);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*src*/ 16 && !src_url_equal(img.src, img_src_value = /*src*/ ctx[4])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(24:4) {#if src}",
    		ctx
    	});

    	return block;
    }

    // (29:4) {#if title}
    function create_if_block_1$2(ctx) {
    	let h5;
    	let t0;
    	let t1;
    	let t2_value = /*extension*/ ctx[0].toLowerCase() + "";
    	let t2;

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			t0 = text(/*title*/ ctx[5]);
    			t1 = text(".");
    			t2 = text(t2_value);
    			attr_dev(h5, "class", "m-0 text-xs font-bold");
    			add_location(h5, file$4, 29, 6, 790);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);
    			append_dev(h5, t0);
    			append_dev(h5, t1);
    			append_dev(h5, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 32) set_data_dev(t0, /*title*/ ctx[5]);
    			if (dirty & /*extension*/ 1 && t2_value !== (t2_value = /*extension*/ ctx[0].toLowerCase() + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(29:4) {#if title}",
    		ctx
    	});

    	return block;
    }

    // (32:4) {#if size}
    function create_if_block$3(ctx) {
    	let h5;
    	let t0_value = /*displaySize*/ ctx[6](/*size*/ ctx[3]) + "";
    	let t0;
    	let t1;

    	let t2_value = (/*extension*/ ctx[0] === "SVG"
    	? ""
    	: `(${/*scale*/ ctx[2]}x)`) + "";

    	let t2;

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			attr_dev(h5, "class", "m-0 text-xs");
    			add_location(h5, file$4, 32, 6, 894);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);
    			append_dev(h5, t0);
    			append_dev(h5, t1);
    			append_dev(h5, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*size*/ 8 && t0_value !== (t0_value = /*displaySize*/ ctx[6](/*size*/ ctx[3]) + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*extension, scale*/ 5 && t2_value !== (t2_value = (/*extension*/ ctx[0] === "SVG"
    			? ""
    			: `(${/*scale*/ ctx[2]}x)`) + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(32:4) {#if size}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let if_block0 = /*icon*/ ctx[1] && create_if_block_3(ctx);
    	let if_block1 = /*src*/ ctx[4] && create_if_block_2$1(ctx);
    	let if_block2 = /*title*/ ctx[5] && create_if_block_1$2(ctx);
    	let if_block3 = /*size*/ ctx[3] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div1 = element("div");
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			attr_dev(div0, "class", "w-16 h-16 rounded-md flex items-center justify-center");
    			add_location(div0, file$4, 19, 2, 479);
    			attr_dev(div1, "class", "flex-grow flex-col gap-1");
    			add_location(div1, file$4, 27, 2, 729);
    			attr_dev(div2, "class", "container w-full flex gap-2 p-2 rounded-lg items-center svelte-19l6a0x");
    			add_location(div2, file$4, 18, 0, 407);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t0);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			if (if_block2) if_block2.m(div1, null);
    			append_dev(div1, t2);
    			if (if_block3) if_block3.m(div1, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*icon*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(div0, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*src*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$1(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*title*/ ctx[5]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1$2(ctx);
    					if_block2.c();
    					if_block2.m(div1, t2);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*size*/ ctx[3]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block$3(ctx);
    					if_block3.c();
    					if_block3.m(div1, null);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PreviewCard', slots, []);
    	let { extension = undefined } = $$props;
    	let { icon = undefined } = $$props;
    	let { scale = undefined } = $$props;
    	let { size = undefined } = $$props;
    	let { src = undefined } = $$props;
    	let { title = undefined } = $$props;

    	const displaySize = size => {
    		const rounded = {
    			width: Math.round(size.width),
    			height: Math.round(size.height)
    		};

    		return `${rounded.width}x${rounded.height}`;
    	};

    	const writable_props = ['extension', 'icon', 'scale', 'size', 'src', 'title'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PreviewCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('extension' in $$props) $$invalidate(0, extension = $$props.extension);
    		if ('icon' in $$props) $$invalidate(1, icon = $$props.icon);
    		if ('scale' in $$props) $$invalidate(2, scale = $$props.scale);
    		if ('size' in $$props) $$invalidate(3, size = $$props.size);
    		if ('src' in $$props) $$invalidate(4, src = $$props.src);
    		if ('title' in $$props) $$invalidate(5, title = $$props.title);
    	};

    	$$self.$capture_state = () => ({
    		extension,
    		icon,
    		scale,
    		size,
    		src,
    		title,
    		displaySize
    	});

    	$$self.$inject_state = $$props => {
    		if ('extension' in $$props) $$invalidate(0, extension = $$props.extension);
    		if ('icon' in $$props) $$invalidate(1, icon = $$props.icon);
    		if ('scale' in $$props) $$invalidate(2, scale = $$props.scale);
    		if ('size' in $$props) $$invalidate(3, size = $$props.size);
    		if ('src' in $$props) $$invalidate(4, src = $$props.src);
    		if ('title' in $$props) $$invalidate(5, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [extension, icon, scale, size, src, title, displaySize];
    }

    class PreviewCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			extension: 0,
    			icon: 1,
    			scale: 2,
    			size: 3,
    			src: 4,
    			title: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PreviewCard",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get extension() {
    		throw new Error("<PreviewCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set extension(value) {
    		throw new Error("<PreviewCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<PreviewCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<PreviewCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scale() {
    		throw new Error("<PreviewCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scale(value) {
    		throw new Error("<PreviewCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<PreviewCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<PreviewCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get src() {
    		throw new Error("<PreviewCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<PreviewCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<PreviewCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<PreviewCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z$1 = ".overlay.svelte-118envp{background-color:#fff}.figma-dark .overlay{background-color:#2c2c2c!important}";
    styleInject(css_248z$1);

    /* src/lib/components/Overlay.svelte generated by Svelte v3.48.0 */
    const file$3 = "src/lib/components/Overlay.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let i;
    	let div1_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			i = element("i");
    			attr_dev(i, "class", "mr-2 text-xl fa-sharp fa-solid fa-spin fa-spinner-third");
    			add_location(i, file$3, 6, 4, 242);
    			attr_dev(div0, "class", "absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2");
    			add_location(div0, file$3, 5, 2, 164);
    			attr_dev(div1, "class", "overlay absolute top-0 left-0 w-full h-full min-h-[200px] bg-white z-[999] svelte-118envp");
    			add_location(div1, file$3, 4, 0, 64);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			if (div1_outro) div1_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			div1_outro = create_out_transition(div1, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_outro) div1_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Overlay', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Overlay> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ fade });
    	return [];
    }

    class Overlay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Overlay",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/lib/components/Controls/Preview.svelte generated by Svelte v3.48.0 */
    const file$2 = "src/lib/components/Controls/Preview.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (12:4) {#if showLoader === true || showLoader === undefined}
    function create_if_block_2(ctx) {
    	let overlay;
    	let current;
    	overlay = new Overlay({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(overlay.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(overlay, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(overlay.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(overlay.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(overlay, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(12:4) {#if showLoader === true || showLoader === undefined}",
    		ctx
    	});

    	return block;
    }

    // (15:4) {#if exampleAssets.length > 0}
    function create_if_block$2(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*exampleFile*/ ctx[1] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*exampleFile*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*exampleFile*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(15:4) {#if exampleAssets.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (16:8) {#if exampleFile}
    function create_if_block_1$1(ctx) {
    	let previewcard;
    	let current;

    	previewcard = new PreviewCard({
    			props: {
    				icon: "file",
    				title: /*exampleFile*/ ctx[1].filename,
    				extension: /*exampleFile*/ ctx[1].extension.value
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(previewcard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(previewcard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const previewcard_changes = {};
    			if (dirty & /*exampleFile*/ 2) previewcard_changes.title = /*exampleFile*/ ctx[1].filename;
    			if (dirty & /*exampleFile*/ 2) previewcard_changes.extension = /*exampleFile*/ ctx[1].extension.value;
    			previewcard.$set(previewcard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(previewcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(previewcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(previewcard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(16:8) {#if exampleFile}",
    		ctx
    	});

    	return block;
    }

    // (20:4) {#each exampleAssets as asset}
    function create_each_block(ctx) {
    	let previewcard;
    	let current;

    	previewcard = new PreviewCard({
    			props: {
    				title: /*asset*/ ctx[4].filename,
    				extension: /*asset*/ ctx[4].extension.value,
    				size: /*asset*/ ctx[4].size,
    				scale: /*scale*/ ctx[2].value,
    				src: /*asset*/ ctx[4].url
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(previewcard.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(previewcard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const previewcard_changes = {};
    			if (dirty & /*exampleAssets*/ 1) previewcard_changes.title = /*asset*/ ctx[4].filename;
    			if (dirty & /*exampleAssets*/ 1) previewcard_changes.extension = /*asset*/ ctx[4].extension.value;
    			if (dirty & /*exampleAssets*/ 1) previewcard_changes.size = /*asset*/ ctx[4].size;
    			if (dirty & /*scale*/ 4) previewcard_changes.scale = /*scale*/ ctx[2].value;
    			if (dirty & /*exampleAssets*/ 1) previewcard_changes.src = /*asset*/ ctx[4].url;
    			previewcard.$set(previewcard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(previewcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(previewcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(previewcard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(20:4) {#each exampleAssets as asset}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let current;
    	let if_block0 = (/*showLoader*/ ctx[3] === true || /*showLoader*/ ctx[3] === undefined) && create_if_block_2(ctx);
    	let if_block1 = /*exampleAssets*/ ctx[0].length > 0 && create_if_block$2(ctx);
    	let each_value = /*exampleAssets*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "w-full flex flex-wrap gap-2 relative");
    			add_location(div, file$2, 10, 0, 250);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showLoader*/ ctx[3] === true || /*showLoader*/ ctx[3] === undefined) {
    				if (if_block0) {
    					if (dirty & /*showLoader*/ 8) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*exampleAssets*/ ctx[0].length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*exampleAssets*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*exampleAssets, scale*/ 5) {
    				each_value = /*exampleAssets*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Preview', slots, []);
    	let { exampleAssets = [] } = $$props;
    	let { exampleFile = undefined } = $$props;
    	let { scale = undefined } = $$props;
    	let { showLoader } = $$props;
    	const writable_props = ['exampleAssets', 'exampleFile', 'scale', 'showLoader'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Preview> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('exampleAssets' in $$props) $$invalidate(0, exampleAssets = $$props.exampleAssets);
    		if ('exampleFile' in $$props) $$invalidate(1, exampleFile = $$props.exampleFile);
    		if ('scale' in $$props) $$invalidate(2, scale = $$props.scale);
    		if ('showLoader' in $$props) $$invalidate(3, showLoader = $$props.showLoader);
    	};

    	$$self.$capture_state = () => ({
    		PreviewCard,
    		Overlay,
    		exampleAssets,
    		exampleFile,
    		scale,
    		showLoader
    	});

    	$$self.$inject_state = $$props => {
    		if ('exampleAssets' in $$props) $$invalidate(0, exampleAssets = $$props.exampleAssets);
    		if ('exampleFile' in $$props) $$invalidate(1, exampleFile = $$props.exampleFile);
    		if ('scale' in $$props) $$invalidate(2, scale = $$props.scale);
    		if ('showLoader' in $$props) $$invalidate(3, showLoader = $$props.showLoader);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [exampleAssets, exampleFile, scale, showLoader];
    }

    class Preview extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			exampleAssets: 0,
    			exampleFile: 1,
    			scale: 2,
    			showLoader: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Preview",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*showLoader*/ ctx[3] === undefined && !('showLoader' in props)) {
    			console.warn("<Preview> was created without expected prop 'showLoader'");
    		}
    	}

    	get exampleAssets() {
    		throw new Error("<Preview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exampleAssets(value) {
    		throw new Error("<Preview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get exampleFile() {
    		throw new Error("<Preview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exampleFile(value) {
    		throw new Error("<Preview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scale() {
    		throw new Error("<Preview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scale(value) {
    		throw new Error("<Preview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showLoader() {
    		throw new Error("<Preview>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showLoader(value) {
    		throw new Error("<Preview>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/lib/components/Controls/Text.svelte generated by Svelte v3.48.0 */
    const file$1 = "src/lib/components/Controls/Text.svelte";

    // (21:4) {#if showVariablesButton}
    function create_if_block$1(ctx) {
    	let hovericon;
    	let current;

    	hovericon = new HoverIcon({
    			props: {
    				text: true,
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	hovericon.$on("onClick", /*onClick_handler*/ ctx[18]);

    	const block = {
    		c: function create() {
    			create_component(hovericon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(hovericon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const hovericon_changes = {};

    			if (dirty & /*$$scope*/ 524288) {
    				hovericon_changes.$$scope = { dirty, ctx };
    			}

    			hovericon.$set(hovericon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hovericon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hovericon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(hovericon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(21:4) {#if showVariablesButton}",
    		ctx
    	});

    	return block;
    }

    // (22:4) <HoverIcon text={true} on:onClick={() => dispatch("writeVariables")}>
    function create_default_slot$1(ctx) {
    	let i;
    	let t0;
    	let p;

    	const block = {
    		c: function create() {
    			i = element("i");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Generate variable text";
    			attr_dev(i, "class", "mr-2 text-xs fa-sharp fa-solid fa-text");
    			add_location(i, file$1, 22, 14, 1195);
    			attr_dev(p, "class", "m-0 text-xs");
    			add_location(p, file$1, 23, 14, 1262);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(22:4) <HoverIcon text={true} on:onClick={() => dispatch(\\\"writeVariables\\\")}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let checkbox0;
    	let updating_value;
    	let updating_checked;
    	let t0;
    	let checkbox1;
    	let updating_value_1;
    	let updating_checked_1;
    	let t1;
    	let checkbox2;
    	let updating_value_2;
    	let updating_checked_2;
    	let t2;
    	let checkbox3;
    	let updating_value_3;
    	let updating_checked_3;
    	let t3;
    	let current;

    	function checkbox0_value_binding(value) {
    		/*checkbox0_value_binding*/ ctx[6](value);
    	}

    	function checkbox0_checked_binding(value) {
    		/*checkbox0_checked_binding*/ ctx[7](value);
    	}

    	let checkbox0_props = { label: "Style text segments" };

    	if (/*styleTextSegments*/ ctx[3] !== void 0) {
    		checkbox0_props.value = /*styleTextSegments*/ ctx[3];
    	}

    	if (/*styleTextSegments*/ ctx[3] !== void 0) {
    		checkbox0_props.checked = /*styleTextSegments*/ ctx[3];
    	}

    	checkbox0 = new Checkbox({ props: checkbox0_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox0, 'value', checkbox0_value_binding));
    	binding_callbacks.push(() => bind(checkbox0, 'checked', checkbox0_checked_binding));
    	checkbox0.$on("change", /*change_handler*/ ctx[8]);

    	function checkbox1_value_binding(value) {
    		/*checkbox1_value_binding*/ ctx[9](value);
    	}

    	function checkbox1_checked_binding(value) {
    		/*checkbox1_checked_binding*/ ctx[10](value);
    	}

    	let checkbox1_props = { label: "Include Figma styles as classes" };

    	if (/*applyStyleNames*/ ctx[1] !== void 0) {
    		checkbox1_props.value = /*applyStyleNames*/ ctx[1];
    	}

    	if (/*applyStyleNames*/ ctx[1] !== void 0) {
    		checkbox1_props.checked = /*applyStyleNames*/ ctx[1];
    	}

    	checkbox1 = new Checkbox({ props: checkbox1_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox1, 'value', checkbox1_value_binding));
    	binding_callbacks.push(() => bind(checkbox1, 'checked', checkbox1_checked_binding));
    	checkbox1.$on("change", /*change_handler_1*/ ctx[11]);

    	function checkbox2_value_binding(value) {
    		/*checkbox2_value_binding*/ ctx[12](value);
    	}

    	function checkbox2_checked_binding(value) {
    		/*checkbox2_checked_binding*/ ctx[13](value);
    	}

    	let checkbox2_props = {
    		label: "Convert header styles to <h> tags"
    	};

    	if (/*applyHtags*/ ctx[0] !== void 0) {
    		checkbox2_props.value = /*applyHtags*/ ctx[0];
    	}

    	if (/*applyHtags*/ ctx[0] !== void 0) {
    		checkbox2_props.checked = /*applyHtags*/ ctx[0];
    	}

    	checkbox2 = new Checkbox({ props: checkbox2_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox2, 'value', checkbox2_value_binding));
    	binding_callbacks.push(() => bind(checkbox2, 'checked', checkbox2_checked_binding));
    	checkbox2.$on("change", /*change_handler_2*/ ctx[14]);

    	function checkbox3_value_binding(value) {
    		/*checkbox3_value_binding*/ ctx[15](value);
    	}

    	function checkbox3_checked_binding(value) {
    		/*checkbox3_checked_binding*/ ctx[16](value);
    	}

    	let checkbox3_props = { label: "Include Google fonts" };

    	if (/*includeGoogleFonts*/ ctx[2] !== void 0) {
    		checkbox3_props.value = /*includeGoogleFonts*/ ctx[2];
    	}

    	if (/*includeGoogleFonts*/ ctx[2] !== void 0) {
    		checkbox3_props.checked = /*includeGoogleFonts*/ ctx[2];
    	}

    	checkbox3 = new Checkbox({ props: checkbox3_props, $$inline: true });
    	binding_callbacks.push(() => bind(checkbox3, 'value', checkbox3_value_binding));
    	binding_callbacks.push(() => bind(checkbox3, 'checked', checkbox3_checked_binding));
    	checkbox3.$on("change", /*change_handler_3*/ ctx[17]);
    	let if_block = /*showVariablesButton*/ ctx[4] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(checkbox0.$$.fragment);
    			t0 = space();
    			create_component(checkbox1.$$.fragment);
    			t1 = space();
    			create_component(checkbox2.$$.fragment);
    			t2 = space();
    			create_component(checkbox3.$$.fragment);
    			t3 = space();
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "w-full flex flex-col gap-2");
    			add_location(div, file$1, 15, 0, 417);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(checkbox0, div, null);
    			append_dev(div, t0);
    			mount_component(checkbox1, div, null);
    			append_dev(div, t1);
    			mount_component(checkbox2, div, null);
    			append_dev(div, t2);
    			mount_component(checkbox3, div, null);
    			append_dev(div, t3);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const checkbox0_changes = {};

    			if (!updating_value && dirty & /*styleTextSegments*/ 8) {
    				updating_value = true;
    				checkbox0_changes.value = /*styleTextSegments*/ ctx[3];
    				add_flush_callback(() => updating_value = false);
    			}

    			if (!updating_checked && dirty & /*styleTextSegments*/ 8) {
    				updating_checked = true;
    				checkbox0_changes.checked = /*styleTextSegments*/ ctx[3];
    				add_flush_callback(() => updating_checked = false);
    			}

    			checkbox0.$set(checkbox0_changes);
    			const checkbox1_changes = {};

    			if (!updating_value_1 && dirty & /*applyStyleNames*/ 2) {
    				updating_value_1 = true;
    				checkbox1_changes.value = /*applyStyleNames*/ ctx[1];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			if (!updating_checked_1 && dirty & /*applyStyleNames*/ 2) {
    				updating_checked_1 = true;
    				checkbox1_changes.checked = /*applyStyleNames*/ ctx[1];
    				add_flush_callback(() => updating_checked_1 = false);
    			}

    			checkbox1.$set(checkbox1_changes);
    			const checkbox2_changes = {};

    			if (!updating_value_2 && dirty & /*applyHtags*/ 1) {
    				updating_value_2 = true;
    				checkbox2_changes.value = /*applyHtags*/ ctx[0];
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			if (!updating_checked_2 && dirty & /*applyHtags*/ 1) {
    				updating_checked_2 = true;
    				checkbox2_changes.checked = /*applyHtags*/ ctx[0];
    				add_flush_callback(() => updating_checked_2 = false);
    			}

    			checkbox2.$set(checkbox2_changes);
    			const checkbox3_changes = {};

    			if (!updating_value_3 && dirty & /*includeGoogleFonts*/ 4) {
    				updating_value_3 = true;
    				checkbox3_changes.value = /*includeGoogleFonts*/ ctx[2];
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			if (!updating_checked_3 && dirty & /*includeGoogleFonts*/ 4) {
    				updating_checked_3 = true;
    				checkbox3_changes.checked = /*includeGoogleFonts*/ ctx[2];
    				add_flush_callback(() => updating_checked_3 = false);
    			}

    			checkbox3.$set(checkbox3_changes);

    			if (/*showVariablesButton*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showVariablesButton*/ 16) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkbox0.$$.fragment, local);
    			transition_in(checkbox1.$$.fragment, local);
    			transition_in(checkbox2.$$.fragment, local);
    			transition_in(checkbox3.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkbox0.$$.fragment, local);
    			transition_out(checkbox1.$$.fragment, local);
    			transition_out(checkbox2.$$.fragment, local);
    			transition_out(checkbox3.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(checkbox0);
    			destroy_component(checkbox1);
    			destroy_component(checkbox2);
    			destroy_component(checkbox3);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Text', slots, []);
    	const dispatch = createEventDispatcher();
    	let { applyHtags = false } = $$props;
    	let { applyStyleNames = false } = $$props;
    	let { includeGoogleFonts = false } = $$props;
    	let { showVariablesButton = false } = $$props;
    	let { styleTextSegments = false } = $$props;

    	const writable_props = [
    		'applyHtags',
    		'applyStyleNames',
    		'includeGoogleFonts',
    		'showVariablesButton',
    		'styleTextSegments'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Text> was created with unknown prop '${key}'`);
    	});

    	function checkbox0_value_binding(value) {
    		styleTextSegments = value;
    		$$invalidate(3, styleTextSegments);
    	}

    	function checkbox0_checked_binding(value) {
    		styleTextSegments = value;
    		$$invalidate(3, styleTextSegments);
    	}

    	const change_handler = () => dispatch("changeConfig");

    	function checkbox1_value_binding(value) {
    		applyStyleNames = value;
    		$$invalidate(1, applyStyleNames);
    	}

    	function checkbox1_checked_binding(value) {
    		applyStyleNames = value;
    		$$invalidate(1, applyStyleNames);
    	}

    	const change_handler_1 = () => dispatch("changeConfig");

    	function checkbox2_value_binding(value) {
    		applyHtags = value;
    		$$invalidate(0, applyHtags);
    	}

    	function checkbox2_checked_binding(value) {
    		applyHtags = value;
    		$$invalidate(0, applyHtags);
    	}

    	const change_handler_2 = () => dispatch("changeConfig");

    	function checkbox3_value_binding(value) {
    		includeGoogleFonts = value;
    		$$invalidate(2, includeGoogleFonts);
    	}

    	function checkbox3_checked_binding(value) {
    		includeGoogleFonts = value;
    		$$invalidate(2, includeGoogleFonts);
    	}

    	const change_handler_3 = () => dispatch("changeConfig");
    	const onClick_handler = () => dispatch("writeVariables");

    	$$self.$$set = $$props => {
    		if ('applyHtags' in $$props) $$invalidate(0, applyHtags = $$props.applyHtags);
    		if ('applyStyleNames' in $$props) $$invalidate(1, applyStyleNames = $$props.applyStyleNames);
    		if ('includeGoogleFonts' in $$props) $$invalidate(2, includeGoogleFonts = $$props.includeGoogleFonts);
    		if ('showVariablesButton' in $$props) $$invalidate(4, showVariablesButton = $$props.showVariablesButton);
    		if ('styleTextSegments' in $$props) $$invalidate(3, styleTextSegments = $$props.styleTextSegments);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Checkbox,
    		HoverIcon,
    		dispatch,
    		applyHtags,
    		applyStyleNames,
    		includeGoogleFonts,
    		showVariablesButton,
    		styleTextSegments
    	});

    	$$self.$inject_state = $$props => {
    		if ('applyHtags' in $$props) $$invalidate(0, applyHtags = $$props.applyHtags);
    		if ('applyStyleNames' in $$props) $$invalidate(1, applyStyleNames = $$props.applyStyleNames);
    		if ('includeGoogleFonts' in $$props) $$invalidate(2, includeGoogleFonts = $$props.includeGoogleFonts);
    		if ('showVariablesButton' in $$props) $$invalidate(4, showVariablesButton = $$props.showVariablesButton);
    		if ('styleTextSegments' in $$props) $$invalidate(3, styleTextSegments = $$props.styleTextSegments);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		applyHtags,
    		applyStyleNames,
    		includeGoogleFonts,
    		styleTextSegments,
    		showVariablesButton,
    		dispatch,
    		checkbox0_value_binding,
    		checkbox0_checked_binding,
    		change_handler,
    		checkbox1_value_binding,
    		checkbox1_checked_binding,
    		change_handler_1,
    		checkbox2_value_binding,
    		checkbox2_checked_binding,
    		change_handler_2,
    		checkbox3_value_binding,
    		checkbox3_checked_binding,
    		change_handler_3,
    		onClick_handler
    	];
    }

    class Text extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			applyHtags: 0,
    			applyStyleNames: 1,
    			includeGoogleFonts: 2,
    			showVariablesButton: 4,
    			styleTextSegments: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Text",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get applyHtags() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set applyHtags(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get applyStyleNames() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set applyStyleNames(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get includeGoogleFonts() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set includeGoogleFonts(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showVariablesButton() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showVariablesButton(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleTextSegments() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleTextSegments(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var css_248z = ".content.svelte-1sr9svg{color:var(--figma-color-text);min-height:calc(100% + 48px)}.control-panel.svelte-1sr9svg{border-right:1px solid var(--figma-color-border)}.setting button,.setting div,input,textarea{color:var(--figma-color-text)!important}.setting button,input,textarea{background-color:var(--figma-color-bg-secondary)!important;border:none!important;border-radius:4px!important}.input input,.setting button{height:36px!important}svg{fill:var(--figma-color-text)!important}button svg{fill:var(--figma-color-text-secondary)!important}.content button{background-color:var(--figma-color-bg-secondary)!important;border-radius:4px!important;height:40px!important;margin-top:8px!important}.content button:hover{background-color:var(--figma-color-bg-tertiary)!important}.content button:focus{outline:1px solid var(--figma-color-border-selected)}.content button .label,.content button .placeholder{color:var(--figma-color-text)!important;margin-top:0!important}.content button .caret svg path{fill:var(--figma-color-text-secondary)!important}.content button:hover .caret svg path{fill:var(--figma-color-text)!important}.content ul li .label{color:var(--figma-color-bg)!important}.figma-dark .content ul li .label{color:var(--figma-color-text)!important}";
    styleInject(css_248z);

    /* src/App.svelte generated by Svelte v3.48.0 */
    const file = "src/App.svelte";

    // (247:4) {#if views}
    function create_if_block_1(ctx) {
    	let panel0;
    	let updating_expanded;
    	let t0;
    	let panel1;
    	let updating_expanded_1;
    	let t1;
    	let panel2;
    	let updating_expanded_2;
    	let t2;
    	let panel3;
    	let updating_expanded_3;
    	let current;

    	function panel0_expanded_binding(value) {
    		/*panel0_expanded_binding*/ ctx[43](value);
    	}

    	let panel0_props = {
    		title: "File settings",
    		$$slots: { default: [create_default_slot_4] },
    		$$scope: { ctx }
    	};

    	if (/*views*/ ctx[7].file !== void 0) {
    		panel0_props.expanded = /*views*/ ctx[7].file;
    	}

    	panel0 = new Panel({ props: panel0_props, $$inline: true });
    	binding_callbacks.push(() => bind(panel0, 'expanded', panel0_expanded_binding));
    	panel0.$on("changeView", /*onChangeView*/ ctx[30]);

    	function panel1_expanded_binding(value) {
    		/*panel1_expanded_binding*/ ctx[50](value);
    	}

    	let panel1_props = {
    		title: "Image settings",
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	};

    	if (/*views*/ ctx[7].images !== void 0) {
    		panel1_props.expanded = /*views*/ ctx[7].images;
    	}

    	panel1 = new Panel({ props: panel1_props, $$inline: true });
    	binding_callbacks.push(() => bind(panel1, 'expanded', panel1_expanded_binding));
    	panel1.$on("changeView", /*onChangeView*/ ctx[30]);

    	function panel2_expanded_binding(value) {
    		/*panel2_expanded_binding*/ ctx[57](value);
    	}

    	let panel2_props = {
    		title: "Page settings",
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	};

    	if (/*views*/ ctx[7].page !== void 0) {
    		panel2_props.expanded = /*views*/ ctx[7].page;
    	}

    	panel2 = new Panel({ props: panel2_props, $$inline: true });
    	binding_callbacks.push(() => bind(panel2, 'expanded', panel2_expanded_binding));
    	panel2.$on("changeView", /*onChangeView*/ ctx[30]);

    	function panel3_expanded_binding(value) {
    		/*panel3_expanded_binding*/ ctx[63](value);
    	}

    	let panel3_props = {
    		title: "Text settings",
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	if (/*views*/ ctx[7].text !== void 0) {
    		panel3_props.expanded = /*views*/ ctx[7].text;
    	}

    	panel3 = new Panel({ props: panel3_props, $$inline: true });
    	binding_callbacks.push(() => bind(panel3, 'expanded', panel3_expanded_binding));
    	panel3.$on("changeView", /*onChangeView*/ ctx[30]);

    	const block = {
    		c: function create() {
    			create_component(panel0.$$.fragment);
    			t0 = space();
    			create_component(panel1.$$.fragment);
    			t1 = space();
    			create_component(panel2.$$.fragment);
    			t2 = space();
    			create_component(panel3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(panel0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(panel1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(panel2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(panel3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const panel0_changes = {};

    			if (dirty[0] & /*fileType, testingMode, fileTypeOptions, syntax, errorMessage*/ 2371 | dirty[2] & /*$$scope*/ 65536) {
    				panel0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_expanded && dirty[0] & /*views*/ 128) {
    				updating_expanded = true;
    				panel0_changes.expanded = /*views*/ ctx[7].file;
    				add_flush_callback(() => updating_expanded = false);
    			}

    			panel0.$set(panel0_changes);
    			const panel1_changes = {};

    			if (dirty[0] & /*scaleOptions, scale, extensionOptions, extension, imagePath, altText*/ 1572924 | dirty[2] & /*$$scope*/ 65536) {
    				panel1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_expanded_1 && dirty[0] & /*views*/ 128) {
    				updating_expanded_1 = true;
    				panel1_changes.expanded = /*views*/ ctx[7].images;
    				add_flush_callback(() => updating_expanded_1 = false);
    			}

    			panel1.$set(panel1_changes);
    			const panel2_changes = {};

    			if (dirty[0] & /*includeResizer, centerHtmlOutput, fluid, maxWidth, customScript, clickableLink*/ 2496000 | dirty[2] & /*$$scope*/ 65536) {
    				panel2_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_expanded_2 && dirty[0] & /*views*/ 128) {
    				updating_expanded_2 = true;
    				panel2_changes.expanded = /*views*/ ctx[7].page;
    				add_flush_callback(() => updating_expanded_2 = false);
    			}

    			panel2.$set(panel2_changes);
    			const panel3_changes = {};

    			if (dirty[0] & /*showVariablesButton, styleTextSegments, applyStyleNames, applyHtags, includeGoogleFonts*/ 33677312 | dirty[2] & /*$$scope*/ 65536) {
    				panel3_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_expanded_3 && dirty[0] & /*views*/ 128) {
    				updating_expanded_3 = true;
    				panel3_changes.expanded = /*views*/ ctx[7].text;
    				add_flush_callback(() => updating_expanded_3 = false);
    			}

    			panel3.$set(panel3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(panel0.$$.fragment, local);
    			transition_in(panel1.$$.fragment, local);
    			transition_in(panel2.$$.fragment, local);
    			transition_in(panel3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(panel0.$$.fragment, local);
    			transition_out(panel1.$$.fragment, local);
    			transition_out(panel2.$$.fragment, local);
    			transition_out(panel3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(panel0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(panel1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(panel2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(panel3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(247:4) {#if views}",
    		ctx
    	});

    	return block;
    }

    // (248:6) <Panel title="File settings" bind:expanded={views.file} on:changeView={onChangeView}>
    function create_default_slot_4(ctx) {
    	let file_1;
    	let updating_fileType;
    	let updating_testingMode;
    	let updating_menuItems;
    	let updating_syntax;
    	let updating_errorMessage;
    	let current;

    	function file_1_fileType_binding(value) {
    		/*file_1_fileType_binding*/ ctx[37](value);
    	}

    	function file_1_testingMode_binding(value) {
    		/*file_1_testingMode_binding*/ ctx[38](value);
    	}

    	function file_1_menuItems_binding(value) {
    		/*file_1_menuItems_binding*/ ctx[39](value);
    	}

    	function file_1_syntax_binding(value) {
    		/*file_1_syntax_binding*/ ctx[40](value);
    	}

    	function file_1_errorMessage_binding(value) {
    		/*file_1_errorMessage_binding*/ ctx[41](value);
    	}

    	let file_1_props = {};

    	if (/*fileType*/ ctx[0] !== void 0) {
    		file_1_props.fileType = /*fileType*/ ctx[0];
    	}

    	if (/*testingMode*/ ctx[11] !== void 0) {
    		file_1_props.testingMode = /*testingMode*/ ctx[11];
    	}

    	if (/*fileTypeOptions*/ ctx[1] !== void 0) {
    		file_1_props.menuItems = /*fileTypeOptions*/ ctx[1];
    	}

    	if (/*syntax*/ ctx[8] !== void 0) {
    		file_1_props.syntax = /*syntax*/ ctx[8];
    	}

    	if (/*errorMessage*/ ctx[6] !== void 0) {
    		file_1_props.errorMessage = /*errorMessage*/ ctx[6];
    	}

    	file_1 = new File({ props: file_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(file_1, 'fileType', file_1_fileType_binding));
    	binding_callbacks.push(() => bind(file_1, 'testingMode', file_1_testingMode_binding));
    	binding_callbacks.push(() => bind(file_1, 'menuItems', file_1_menuItems_binding));
    	binding_callbacks.push(() => bind(file_1, 'syntax', file_1_syntax_binding));
    	binding_callbacks.push(() => bind(file_1, 'errorMessage', file_1_errorMessage_binding));
    	file_1.$on("changeConfig", /*onChangeConfig*/ ctx[27]);
    	file_1.$on("sendError", /*sendError_handler*/ ctx[42]);

    	const block = {
    		c: function create() {
    			create_component(file_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(file_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const file_1_changes = {};

    			if (!updating_fileType && dirty[0] & /*fileType*/ 1) {
    				updating_fileType = true;
    				file_1_changes.fileType = /*fileType*/ ctx[0];
    				add_flush_callback(() => updating_fileType = false);
    			}

    			if (!updating_testingMode && dirty[0] & /*testingMode*/ 2048) {
    				updating_testingMode = true;
    				file_1_changes.testingMode = /*testingMode*/ ctx[11];
    				add_flush_callback(() => updating_testingMode = false);
    			}

    			if (!updating_menuItems && dirty[0] & /*fileTypeOptions*/ 2) {
    				updating_menuItems = true;
    				file_1_changes.menuItems = /*fileTypeOptions*/ ctx[1];
    				add_flush_callback(() => updating_menuItems = false);
    			}

    			if (!updating_syntax && dirty[0] & /*syntax*/ 256) {
    				updating_syntax = true;
    				file_1_changes.syntax = /*syntax*/ ctx[8];
    				add_flush_callback(() => updating_syntax = false);
    			}

    			if (!updating_errorMessage && dirty[0] & /*errorMessage*/ 64) {
    				updating_errorMessage = true;
    				file_1_changes.errorMessage = /*errorMessage*/ ctx[6];
    				add_flush_callback(() => updating_errorMessage = false);
    			}

    			file_1.$set(file_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(file_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(file_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(file_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(248:6) <Panel title=\\\"File settings\\\" bind:expanded={views.file} on:changeView={onChangeView}>",
    		ctx
    	});

    	return block;
    }

    // (259:6) <Panel title="Image settings" bind:expanded={views.images} on:changeView={onChangeView}>
    function create_default_slot_3(ctx) {
    	let images;
    	let updating_scaleOptions;
    	let updating_scale;
    	let updating_extensionOptions;
    	let updating_extension;
    	let updating_imagePath;
    	let updating_altText;
    	let current;

    	function images_scaleOptions_binding(value) {
    		/*images_scaleOptions_binding*/ ctx[44](value);
    	}

    	function images_scale_binding(value) {
    		/*images_scale_binding*/ ctx[45](value);
    	}

    	function images_extensionOptions_binding(value) {
    		/*images_extensionOptions_binding*/ ctx[46](value);
    	}

    	function images_extension_binding(value) {
    		/*images_extension_binding*/ ctx[47](value);
    	}

    	function images_imagePath_binding(value) {
    		/*images_imagePath_binding*/ ctx[48](value);
    	}

    	function images_altText_binding(value) {
    		/*images_altText_binding*/ ctx[49](value);
    	}

    	let images_props = {};

    	if (/*scaleOptions*/ ctx[5] !== void 0) {
    		images_props.scaleOptions = /*scaleOptions*/ ctx[5];
    	}

    	if (/*scale*/ ctx[4] !== void 0) {
    		images_props.scale = /*scale*/ ctx[4];
    	}

    	if (/*extensionOptions*/ ctx[3] !== void 0) {
    		images_props.extensionOptions = /*extensionOptions*/ ctx[3];
    	}

    	if (/*extension*/ ctx[2] !== void 0) {
    		images_props.extension = /*extension*/ ctx[2];
    	}

    	if (/*imagePath*/ ctx[19] !== void 0) {
    		images_props.imagePath = /*imagePath*/ ctx[19];
    	}

    	if (/*altText*/ ctx[20] !== void 0) {
    		images_props.altText = /*altText*/ ctx[20];
    	}

    	images = new Images({ props: images_props, $$inline: true });
    	binding_callbacks.push(() => bind(images, 'scaleOptions', images_scaleOptions_binding));
    	binding_callbacks.push(() => bind(images, 'scale', images_scale_binding));
    	binding_callbacks.push(() => bind(images, 'extensionOptions', images_extensionOptions_binding));
    	binding_callbacks.push(() => bind(images, 'extension', images_extension_binding));
    	binding_callbacks.push(() => bind(images, 'imagePath', images_imagePath_binding));
    	binding_callbacks.push(() => bind(images, 'altText', images_altText_binding));
    	images.$on("changeConfig", /*onChangeConfig*/ ctx[27]);

    	const block = {
    		c: function create() {
    			create_component(images.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(images, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const images_changes = {};

    			if (!updating_scaleOptions && dirty[0] & /*scaleOptions*/ 32) {
    				updating_scaleOptions = true;
    				images_changes.scaleOptions = /*scaleOptions*/ ctx[5];
    				add_flush_callback(() => updating_scaleOptions = false);
    			}

    			if (!updating_scale && dirty[0] & /*scale*/ 16) {
    				updating_scale = true;
    				images_changes.scale = /*scale*/ ctx[4];
    				add_flush_callback(() => updating_scale = false);
    			}

    			if (!updating_extensionOptions && dirty[0] & /*extensionOptions*/ 8) {
    				updating_extensionOptions = true;
    				images_changes.extensionOptions = /*extensionOptions*/ ctx[3];
    				add_flush_callback(() => updating_extensionOptions = false);
    			}

    			if (!updating_extension && dirty[0] & /*extension*/ 4) {
    				updating_extension = true;
    				images_changes.extension = /*extension*/ ctx[2];
    				add_flush_callback(() => updating_extension = false);
    			}

    			if (!updating_imagePath && dirty[0] & /*imagePath*/ 524288) {
    				updating_imagePath = true;
    				images_changes.imagePath = /*imagePath*/ ctx[19];
    				add_flush_callback(() => updating_imagePath = false);
    			}

    			if (!updating_altText && dirty[0] & /*altText*/ 1048576) {
    				updating_altText = true;
    				images_changes.altText = /*altText*/ ctx[20];
    				add_flush_callback(() => updating_altText = false);
    			}

    			images.$set(images_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(images.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(images.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(images, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(259:6) <Panel title=\\\"Image settings\\\" bind:expanded={views.images} on:changeView={onChangeView}>",
    		ctx
    	});

    	return block;
    }

    // (270:6) <Panel title="Page settings" bind:expanded={views.page} on:changeView={onChangeView}>
    function create_default_slot_2(ctx) {
    	let page;
    	let updating_includeResizer;
    	let updating_centerHtmlOutput;
    	let updating_fluid;
    	let updating_maxWidth;
    	let updating_customScript;
    	let updating_clickableLink;
    	let current;

    	function page_includeResizer_binding(value) {
    		/*page_includeResizer_binding*/ ctx[51](value);
    	}

    	function page_centerHtmlOutput_binding(value) {
    		/*page_centerHtmlOutput_binding*/ ctx[52](value);
    	}

    	function page_fluid_binding(value) {
    		/*page_fluid_binding*/ ctx[53](value);
    	}

    	function page_maxWidth_binding(value) {
    		/*page_maxWidth_binding*/ ctx[54](value);
    	}

    	function page_customScript_binding(value) {
    		/*page_customScript_binding*/ ctx[55](value);
    	}

    	function page_clickableLink_binding(value) {
    		/*page_clickableLink_binding*/ ctx[56](value);
    	}

    	let page_props = {};

    	if (/*includeResizer*/ ctx[9] !== void 0) {
    		page_props.includeResizer = /*includeResizer*/ ctx[9];
    	}

    	if (/*centerHtmlOutput*/ ctx[12] !== void 0) {
    		page_props.centerHtmlOutput = /*centerHtmlOutput*/ ctx[12];
    	}

    	if (/*fluid*/ ctx[10] !== void 0) {
    		page_props.fluid = /*fluid*/ ctx[10];
    	}

    	if (/*maxWidth*/ ctx[18] !== void 0) {
    		page_props.maxWidth = /*maxWidth*/ ctx[18];
    	}

    	if (/*customScript*/ ctx[21] !== void 0) {
    		page_props.customScript = /*customScript*/ ctx[21];
    	}

    	if (/*clickableLink*/ ctx[17] !== void 0) {
    		page_props.clickableLink = /*clickableLink*/ ctx[17];
    	}

    	page = new Page({ props: page_props, $$inline: true });
    	binding_callbacks.push(() => bind(page, 'includeResizer', page_includeResizer_binding));
    	binding_callbacks.push(() => bind(page, 'centerHtmlOutput', page_centerHtmlOutput_binding));
    	binding_callbacks.push(() => bind(page, 'fluid', page_fluid_binding));
    	binding_callbacks.push(() => bind(page, 'maxWidth', page_maxWidth_binding));
    	binding_callbacks.push(() => bind(page, 'customScript', page_customScript_binding));
    	binding_callbacks.push(() => bind(page, 'clickableLink', page_clickableLink_binding));
    	page.$on("changeConfig", /*onChangeConfig*/ ctx[27]);

    	const block = {
    		c: function create() {
    			create_component(page.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(page, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const page_changes = {};

    			if (!updating_includeResizer && dirty[0] & /*includeResizer*/ 512) {
    				updating_includeResizer = true;
    				page_changes.includeResizer = /*includeResizer*/ ctx[9];
    				add_flush_callback(() => updating_includeResizer = false);
    			}

    			if (!updating_centerHtmlOutput && dirty[0] & /*centerHtmlOutput*/ 4096) {
    				updating_centerHtmlOutput = true;
    				page_changes.centerHtmlOutput = /*centerHtmlOutput*/ ctx[12];
    				add_flush_callback(() => updating_centerHtmlOutput = false);
    			}

    			if (!updating_fluid && dirty[0] & /*fluid*/ 1024) {
    				updating_fluid = true;
    				page_changes.fluid = /*fluid*/ ctx[10];
    				add_flush_callback(() => updating_fluid = false);
    			}

    			if (!updating_maxWidth && dirty[0] & /*maxWidth*/ 262144) {
    				updating_maxWidth = true;
    				page_changes.maxWidth = /*maxWidth*/ ctx[18];
    				add_flush_callback(() => updating_maxWidth = false);
    			}

    			if (!updating_customScript && dirty[0] & /*customScript*/ 2097152) {
    				updating_customScript = true;
    				page_changes.customScript = /*customScript*/ ctx[21];
    				add_flush_callback(() => updating_customScript = false);
    			}

    			if (!updating_clickableLink && dirty[0] & /*clickableLink*/ 131072) {
    				updating_clickableLink = true;
    				page_changes.clickableLink = /*clickableLink*/ ctx[17];
    				add_flush_callback(() => updating_clickableLink = false);
    			}

    			page.$set(page_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(page, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(270:6) <Panel title=\\\"Page settings\\\" bind:expanded={views.page} on:changeView={onChangeView}>",
    		ctx
    	});

    	return block;
    }

    // (281:6) <Panel title="Text settings" bind:expanded={views.text} on:changeView={onChangeView}>
    function create_default_slot_1(ctx) {
    	let text_1;
    	let updating_showVariablesButton;
    	let updating_styleTextSegments;
    	let updating_applyStyleNames;
    	let updating_applyHtags;
    	let updating_includeGoogleFonts;
    	let current;

    	function text_1_showVariablesButton_binding(value) {
    		/*text_1_showVariablesButton_binding*/ ctx[58](value);
    	}

    	function text_1_styleTextSegments_binding(value) {
    		/*text_1_styleTextSegments_binding*/ ctx[59](value);
    	}

    	function text_1_applyStyleNames_binding(value) {
    		/*text_1_applyStyleNames_binding*/ ctx[60](value);
    	}

    	function text_1_applyHtags_binding(value) {
    		/*text_1_applyHtags_binding*/ ctx[61](value);
    	}

    	function text_1_includeGoogleFonts_binding(value) {
    		/*text_1_includeGoogleFonts_binding*/ ctx[62](value);
    	}

    	let text_1_props = {};

    	if (/*showVariablesButton*/ ctx[25] !== void 0) {
    		text_1_props.showVariablesButton = /*showVariablesButton*/ ctx[25];
    	}

    	if (/*styleTextSegments*/ ctx[15] !== void 0) {
    		text_1_props.styleTextSegments = /*styleTextSegments*/ ctx[15];
    	}

    	if (/*applyStyleNames*/ ctx[13] !== void 0) {
    		text_1_props.applyStyleNames = /*applyStyleNames*/ ctx[13];
    	}

    	if (/*applyHtags*/ ctx[14] !== void 0) {
    		text_1_props.applyHtags = /*applyHtags*/ ctx[14];
    	}

    	if (/*includeGoogleFonts*/ ctx[16] !== void 0) {
    		text_1_props.includeGoogleFonts = /*includeGoogleFonts*/ ctx[16];
    	}

    	text_1 = new Text({ props: text_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(text_1, 'showVariablesButton', text_1_showVariablesButton_binding));
    	binding_callbacks.push(() => bind(text_1, 'styleTextSegments', text_1_styleTextSegments_binding));
    	binding_callbacks.push(() => bind(text_1, 'applyStyleNames', text_1_applyStyleNames_binding));
    	binding_callbacks.push(() => bind(text_1, 'applyHtags', text_1_applyHtags_binding));
    	binding_callbacks.push(() => bind(text_1, 'includeGoogleFonts', text_1_includeGoogleFonts_binding));
    	text_1.$on("changeConfig", /*onChangeConfig*/ ctx[27]);
    	text_1.$on("writeVariables", /*onWriteVariables*/ ctx[34]);

    	const block = {
    		c: function create() {
    			create_component(text_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(text_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const text_1_changes = {};

    			if (!updating_showVariablesButton && dirty[0] & /*showVariablesButton*/ 33554432) {
    				updating_showVariablesButton = true;
    				text_1_changes.showVariablesButton = /*showVariablesButton*/ ctx[25];
    				add_flush_callback(() => updating_showVariablesButton = false);
    			}

    			if (!updating_styleTextSegments && dirty[0] & /*styleTextSegments*/ 32768) {
    				updating_styleTextSegments = true;
    				text_1_changes.styleTextSegments = /*styleTextSegments*/ ctx[15];
    				add_flush_callback(() => updating_styleTextSegments = false);
    			}

    			if (!updating_applyStyleNames && dirty[0] & /*applyStyleNames*/ 8192) {
    				updating_applyStyleNames = true;
    				text_1_changes.applyStyleNames = /*applyStyleNames*/ ctx[13];
    				add_flush_callback(() => updating_applyStyleNames = false);
    			}

    			if (!updating_applyHtags && dirty[0] & /*applyHtags*/ 16384) {
    				updating_applyHtags = true;
    				text_1_changes.applyHtags = /*applyHtags*/ ctx[14];
    				add_flush_callback(() => updating_applyHtags = false);
    			}

    			if (!updating_includeGoogleFonts && dirty[0] & /*includeGoogleFonts*/ 65536) {
    				updating_includeGoogleFonts = true;
    				text_1_changes.includeGoogleFonts = /*includeGoogleFonts*/ ctx[16];
    				add_flush_callback(() => updating_includeGoogleFonts = false);
    			}

    			text_1.$set(text_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(text_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(281:6) <Panel title=\\\"Text settings\\\" bind:expanded={views.text} on:changeView={onChangeView}>",
    		ctx
    	});

    	return block;
    }

    // (295:4) <Panel title="Output" bind:expanded={views.preview} on:changeView={onChangeView}>
    function create_default_slot(ctx) {
    	let preview;
    	let updating_exampleAssets;
    	let updating_exampleFile;
    	let updating_scale;
    	let updating_showLoader;
    	let current;

    	function preview_exampleAssets_binding(value) {
    		/*preview_exampleAssets_binding*/ ctx[64](value);
    	}

    	function preview_exampleFile_binding(value) {
    		/*preview_exampleFile_binding*/ ctx[65](value);
    	}

    	function preview_scale_binding(value) {
    		/*preview_scale_binding*/ ctx[66](value);
    	}

    	function preview_showLoader_binding(value) {
    		/*preview_showLoader_binding*/ ctx[67](value);
    	}

    	let preview_props = {};

    	if (/*exampleAssets*/ ctx[23] !== void 0) {
    		preview_props.exampleAssets = /*exampleAssets*/ ctx[23];
    	}

    	if (/*exampleFile*/ ctx[24] !== void 0) {
    		preview_props.exampleFile = /*exampleFile*/ ctx[24];
    	}

    	if (/*scale*/ ctx[4] !== void 0) {
    		preview_props.scale = /*scale*/ ctx[4];
    	}

    	if (/*showLoader*/ ctx[26] !== void 0) {
    		preview_props.showLoader = /*showLoader*/ ctx[26];
    	}

    	preview = new Preview({ props: preview_props, $$inline: true });
    	binding_callbacks.push(() => bind(preview, 'exampleAssets', preview_exampleAssets_binding));
    	binding_callbacks.push(() => bind(preview, 'exampleFile', preview_exampleFile_binding));
    	binding_callbacks.push(() => bind(preview, 'scale', preview_scale_binding));
    	binding_callbacks.push(() => bind(preview, 'showLoader', preview_showLoader_binding));

    	const block = {
    		c: function create() {
    			create_component(preview.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(preview, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const preview_changes = {};

    			if (!updating_exampleAssets && dirty[0] & /*exampleAssets*/ 8388608) {
    				updating_exampleAssets = true;
    				preview_changes.exampleAssets = /*exampleAssets*/ ctx[23];
    				add_flush_callback(() => updating_exampleAssets = false);
    			}

    			if (!updating_exampleFile && dirty[0] & /*exampleFile*/ 16777216) {
    				updating_exampleFile = true;
    				preview_changes.exampleFile = /*exampleFile*/ ctx[24];
    				add_flush_callback(() => updating_exampleFile = false);
    			}

    			if (!updating_scale && dirty[0] & /*scale*/ 16) {
    				updating_scale = true;
    				preview_changes.scale = /*scale*/ ctx[4];
    				add_flush_callback(() => updating_scale = false);
    			}

    			if (!updating_showLoader && dirty[0] & /*showLoader*/ 67108864) {
    				updating_showLoader = true;
    				preview_changes.showLoader = /*showLoader*/ ctx[26];
    				add_flush_callback(() => updating_showLoader = false);
    			}

    			preview.$set(preview_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(preview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(preview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(preview, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(295:4) <Panel title=\\\"Output\\\" bind:expanded={views.preview} on:changeView={onChangeView}>",
    		ctx
    	});

    	return block;
    }

    // (301:0) {#if errorMessage}
    function create_if_block(ctx) {
    	let errormessage;
    	let current;

    	errormessage = new ErrorMessage({
    			props: { errorMessage: /*errorMessage*/ ctx[6] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(errormessage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(errormessage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const errormessage_changes = {};
    			if (dirty[0] & /*errorMessage*/ 64) errormessage_changes.errorMessage = /*errorMessage*/ ctx[6];
    			errormessage.$set(errormessage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(errormessage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(errormessage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(errormessage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(301:0) {#if errorMessage}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div0;
    	let i;
    	let t0;
    	let div3;
    	let div1;
    	let t1;
    	let div2;
    	let panel;
    	let updating_expanded;
    	let t2;
    	let t3;
    	let footer;
    	let updating_nodeCount;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*views*/ ctx[7] && create_if_block_1(ctx);

    	function panel_expanded_binding(value) {
    		/*panel_expanded_binding*/ ctx[68](value);
    	}

    	let panel_props = {
    		title: "Output",
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	if (/*views*/ ctx[7].preview !== void 0) {
    		panel_props.expanded = /*views*/ ctx[7].preview;
    	}

    	panel = new Panel({ props: panel_props, $$inline: true });
    	binding_callbacks.push(() => bind(panel, 'expanded', panel_expanded_binding));
    	panel.$on("changeView", /*onChangeView*/ ctx[30]);
    	let if_block1 = /*errorMessage*/ ctx[6] && create_if_block(ctx);

    	function footer_nodeCount_binding(value) {
    		/*footer_nodeCount_binding*/ ctx[69](value);
    	}

    	let footer_props = {};

    	if (/*nodeCount*/ ctx[22] !== void 0) {
    		footer_props.nodeCount = /*nodeCount*/ ctx[22];
    	}

    	footer = new Footer({ props: footer_props, $$inline: true });
    	binding_callbacks.push(() => bind(footer, 'nodeCount', footer_nodeCount_binding));
    	footer.$on("reset", /*onReset*/ ctx[29]);
    	footer.$on("export", /*onSelectExport*/ ctx[28]);
    	footer.$on("save", /*onSaveSettings*/ ctx[31]);
    	footer.$on("load", /*onLoadSettings*/ ctx[33]);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			i = element("i");
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div2 = element("div");
    			create_component(panel.$$.fragment);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(i, "class", "ml-0.5 absolute text-xs text-gray-300 -rotate-45 -translate-x-1/4 -translate-y-1/4 fa-sharp fa-solid fa-grip-dots top-1/2 left-1/2");
    			add_location(i, file, 239, 2, 7391);
    			attr_dev(div0, "id", "corner");
    			attr_dev(div0, "class", "fixed bottom-0 right-0 cursor-se-resize w-4 h-4 z-[999] overflow-hidden");
    			add_location(div0, file, 233, 0, 7234);
    			attr_dev(div1, "class", "flex flex-col w-1/3 min-h-full pb-12 control-panel svelte-1sr9svg");
    			add_location(div1, file, 245, 2, 7602);
    			attr_dev(div2, "class", "sticky w-2/3 h-full pb-12");
    			add_location(div2, file, 293, 2, 9138);
    			attr_dev(div3, "class", "flex w-full overflow-hidden content svelte-1sr9svg");
    			add_location(div3, file, 244, 0, 7550);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, i);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			mount_component(panel, div2, null);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(footer, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "mousedown", /*resizeDown*/ ctx[35], false, false, false),
    					listen_dev(div0, "mouseup", /*resizeUp*/ ctx[36], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*views*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*views*/ 128) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			const panel_changes = {};

    			if (dirty[0] & /*exampleAssets, exampleFile, scale, showLoader*/ 92274704 | dirty[2] & /*$$scope*/ 65536) {
    				panel_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_expanded && dirty[0] & /*views*/ 128) {
    				updating_expanded = true;
    				panel_changes.expanded = /*views*/ ctx[7].preview;
    				add_flush_callback(() => updating_expanded = false);
    			}

    			panel.$set(panel_changes);

    			if (/*errorMessage*/ ctx[6]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*errorMessage*/ 64) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t3.parentNode, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			const footer_changes = {};

    			if (!updating_nodeCount && dirty[0] & /*nodeCount*/ 4194304) {
    				updating_nodeCount = true;
    				footer_changes.nodeCount = /*nodeCount*/ ctx[22];
    				add_flush_callback(() => updating_nodeCount = false);
    			}

    			footer.$set(footer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(panel.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(panel.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			destroy_component(panel);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(footer, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let showLoader;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let errorMessage, errorTimeout, loading = false;
    	let views = {};
    	let fileType = undefined;

    	let fileTypeOptions = [
    		{
    			value: "html",
    			label: "html",
    			group: null,
    			selected: false
    		}
    	]; // { value: "svelte", label: "svelte", group: null, selected: false }, // TO DO

    	let extension = undefined;

    	let extensionOptions = [
    		{
    			value: "PNG",
    			label: "png",
    			group: null,
    			selected: false
    		},
    		{
    			value: "JPG",
    			label: "jpg",
    			group: null,
    			selected: false
    		},
    		{
    			value: "SVG",
    			label: "svg",
    			group: null,
    			selected: false
    		}
    	];

    	let scale = undefined;

    	let scaleOptions = [
    		{ value: 1, label: "1x", selected: false },
    		{ value: 2, label: "2x", selected: false },
    		{ value: 4, label: "4x", selected: false }
    	];

    	let syntax = undefined;
    	let includeResizer = true;
    	let fluid = true;
    	let testingMode = false;
    	let centerHtmlOutput = false;
    	let applyStyleNames = false;
    	let applyHtags = false;
    	let styleTextSegments = true;
    	let includeGoogleFonts = true;
    	let clickableLink = undefined;
    	let maxWidth = undefined;
    	let imagePath = undefined;
    	let altText = undefined;
    	let customScript = undefined;
    	let nodeCount = 0;
    	let exampleAssets = [];
    	let exampleFile;
    	let showVariablesButton = false;

    	const buildConfig = () => {
    		return {
    			syntax,
    			scale,
    			extension,
    			fileType,
    			includeResizer,
    			testingMode,
    			maxWidth,
    			fluid,
    			centerHtmlOutput,
    			clickableLink,
    			imagePath,
    			altText,
    			applyStyleNames,
    			applyHtags,
    			styleTextSegments,
    			includeGoogleFonts,
    			customScript
    		};
    	};

    	window.onmessage = async event => {
    		const message = event.data.pluginMessage;
    		const type = message.type;

    		if (type === "load") {
    			const config = message.config;
    			$$invalidate(7, views = message.views);
    			$$invalidate(8, syntax = config.syntax);
    			$$invalidate(2, extension = config.extension);
    			$$invalidate(4, scale = config.scale);
    			$$invalidate(0, fileType = config.fileType);
    			$$invalidate(9, includeResizer = config.includeResizer);
    			$$invalidate(11, testingMode = config.testingMode);
    			$$invalidate(18, maxWidth = config.maxWidth);
    			$$invalidate(10, fluid = config.fluid);
    			$$invalidate(12, centerHtmlOutput = config.centerHtmlOutput);
    			$$invalidate(17, clickableLink = config.clickableLink);
    			$$invalidate(19, imagePath = config.imagePath);
    			$$invalidate(20, altText = config.altText);
    			$$invalidate(13, applyStyleNames = config.applyStyleNames);
    			$$invalidate(14, applyHtags = config.applyHtags);
    			$$invalidate(15, styleTextSegments = config.styleTextSegments);
    			$$invalidate(16, includeGoogleFonts = config.includeGoogleFonts);
    			$$invalidate(21, customScript = config.customScript);
    		} else if (type === "preview") {
    			const preview = message.preview;
    			$$invalidate(22, nodeCount = preview.nodeCount);
    			$$invalidate(23, exampleAssets = preview.exampleAssets);
    			$$invalidate(24, exampleFile = preview.exampleFile);
    			$$invalidate(23, exampleAssets = await buildPreviewImages(exampleAssets));
    			loading = message.loading;
    		} else if (type === "loading") {
    			loading = message.loading;
    		} else if (type === "export") {
    			const url = await buildZipArchive(message.assets, message.file);
    			const link = document.createElement("a");
    			link.href = url;
    			link.download = `${syntax}.zip`;
    			link.click();

    			setTimeout(
    				() => {
    					loading = false;
    				},
    				1500
    			);
    		} else if (type === "variables") {
    			$$invalidate(25, showVariablesButton = message.variables === null);
    		} else if (type === "error") {
    			setErrorMessage(message.message);
    		}
    	};

    	const postMessage = message => parent.postMessage({ pluginMessage: message }, "*");
    	onMount(() => postMessage({ type: "init" }));
    	const onChangeConfig = () => postMessage({ type: "config", config: buildConfig() });

    	const onSelectExport = () => {
    		loading = true;
    		postMessage({ type: "export", config: buildConfig() });
    	};

    	const onReset = () => postMessage({ type: "reset" });

    	const onChangeView = () => {
    		parent.postMessage({ pluginMessage: { type: "view", views } }, "*");
    	};

    	const onSaveSettings = () => {
    		parent.postMessage({ pluginMessage: { type: "saveSettings" } }, "*");
    	};

    	const setErrorMessage = message => {
    		clearTimeout(errorTimeout);
    		$$invalidate(6, errorMessage = message);

    		// clear error message after 5 seconds
    		errorTimeout = setTimeout(
    			() => {
    				$$invalidate(6, errorMessage = undefined);
    			},
    			3000
    		);
    	};

    	const onLoadSettings = () => {
    		parent.postMessage({ pluginMessage: { type: "loadSettings" } }, "*");
    	};

    	const onWriteVariables = () => {
    		parent.postMessage(
    			{
    				pluginMessage: { type: "writeVariables" }
    			},
    			"*"
    		);
    	};

    	const buildPreviewImages = async assets => {
    		assets.forEach(asset => {
    			let blob = new Blob([asset.data], { type: `image/png` });
    			const url = window.URL.createObjectURL(blob);
    			asset.url = url;
    		});

    		return assets;
    	};

    	const buildZipArchive = async (assets, file) => {
    		let zip = new JSZip();

    		assets.forEach(asset => {
    			const extensionLower = asset.extension.value.toLowerCase();
    			let blob = new Blob([asset.data], { type: `image/${extensionLower}` });
    			zip.file(`${asset.filename}.${extensionLower}`, blob, { base64: true });
    		});

    		let fileBlob = new Blob([file.data], { type: `string` });
    		zip.file(`${file.filename}.${file.extension.value.toLowerCase()}`, fileBlob, { base64: true });
    		const blob = await zip.generateAsync({ type: "blob" });
    		const url = window.URL.createObjectURL(blob);
    		return url;
    	};

    	let resizing = false;

    	const resizeWindow = e => {
    		if (!resizing) return;

    		const size = {
    			w: Math.max(50, Math.floor(e.clientX + 5)),
    			h: Math.max(50, Math.floor(e.clientY + 5))
    		};

    		parent.postMessage({ pluginMessage: { type: "resize", size } }, "*");
    	};

    	const resizeDown = e => {
    		resizing = true;

    		// e.preventDefault();
    		window.addEventListener("mousemove", resizeWindow, true);

    		window.addEventListener("mouseup", resizeUp, true);
    	};

    	const resizeUp = () => {
    		resizing = false;
    		window.removeEventListener("mousemove", resizeWindow, true);
    		window.removeEventListener("mouseup", null);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function file_1_fileType_binding(value) {
    		fileType = value;
    		$$invalidate(0, fileType);
    	}

    	function file_1_testingMode_binding(value) {
    		testingMode = value;
    		$$invalidate(11, testingMode);
    	}

    	function file_1_menuItems_binding(value) {
    		fileTypeOptions = value;
    		($$invalidate(1, fileTypeOptions), $$invalidate(0, fileType));
    	}

    	function file_1_syntax_binding(value) {
    		syntax = value;
    		$$invalidate(8, syntax);
    	}

    	function file_1_errorMessage_binding(value) {
    		errorMessage = value;
    		$$invalidate(6, errorMessage);
    	}

    	const sendError_handler = () => setErrorMessage(errorMessage);

    	function panel0_expanded_binding(value) {
    		if ($$self.$$.not_equal(views.file, value)) {
    			views.file = value;
    			$$invalidate(7, views);
    		}
    	}

    	function images_scaleOptions_binding(value) {
    		scaleOptions = value;
    		($$invalidate(5, scaleOptions), $$invalidate(4, scale));
    	}

    	function images_scale_binding(value) {
    		scale = value;
    		$$invalidate(4, scale);
    	}

    	function images_extensionOptions_binding(value) {
    		extensionOptions = value;
    		($$invalidate(3, extensionOptions), $$invalidate(2, extension));
    	}

    	function images_extension_binding(value) {
    		extension = value;
    		$$invalidate(2, extension);
    	}

    	function images_imagePath_binding(value) {
    		imagePath = value;
    		$$invalidate(19, imagePath);
    	}

    	function images_altText_binding(value) {
    		altText = value;
    		$$invalidate(20, altText);
    	}

    	function panel1_expanded_binding(value) {
    		if ($$self.$$.not_equal(views.images, value)) {
    			views.images = value;
    			$$invalidate(7, views);
    		}
    	}

    	function page_includeResizer_binding(value) {
    		includeResizer = value;
    		$$invalidate(9, includeResizer);
    	}

    	function page_centerHtmlOutput_binding(value) {
    		centerHtmlOutput = value;
    		$$invalidate(12, centerHtmlOutput);
    	}

    	function page_fluid_binding(value) {
    		fluid = value;
    		$$invalidate(10, fluid);
    	}

    	function page_maxWidth_binding(value) {
    		maxWidth = value;
    		$$invalidate(18, maxWidth);
    	}

    	function page_customScript_binding(value) {
    		customScript = value;
    		$$invalidate(21, customScript);
    	}

    	function page_clickableLink_binding(value) {
    		clickableLink = value;
    		$$invalidate(17, clickableLink);
    	}

    	function panel2_expanded_binding(value) {
    		if ($$self.$$.not_equal(views.page, value)) {
    			views.page = value;
    			$$invalidate(7, views);
    		}
    	}

    	function text_1_showVariablesButton_binding(value) {
    		showVariablesButton = value;
    		$$invalidate(25, showVariablesButton);
    	}

    	function text_1_styleTextSegments_binding(value) {
    		styleTextSegments = value;
    		$$invalidate(15, styleTextSegments);
    	}

    	function text_1_applyStyleNames_binding(value) {
    		applyStyleNames = value;
    		$$invalidate(13, applyStyleNames);
    	}

    	function text_1_applyHtags_binding(value) {
    		applyHtags = value;
    		$$invalidate(14, applyHtags);
    	}

    	function text_1_includeGoogleFonts_binding(value) {
    		includeGoogleFonts = value;
    		$$invalidate(16, includeGoogleFonts);
    	}

    	function panel3_expanded_binding(value) {
    		if ($$self.$$.not_equal(views.text, value)) {
    			views.text = value;
    			$$invalidate(7, views);
    		}
    	}

    	function preview_exampleAssets_binding(value) {
    		exampleAssets = value;
    		$$invalidate(23, exampleAssets);
    	}

    	function preview_exampleFile_binding(value) {
    		exampleFile = value;
    		$$invalidate(24, exampleFile);
    	}

    	function preview_scale_binding(value) {
    		scale = value;
    		$$invalidate(4, scale);
    	}

    	function preview_showLoader_binding(value) {
    		showLoader = value;
    		$$invalidate(26, showLoader);
    	}

    	function panel_expanded_binding(value) {
    		if ($$self.$$.not_equal(views.preview, value)) {
    			views.preview = value;
    			$$invalidate(7, views);
    		}
    	}

    	function footer_nodeCount_binding(value) {
    		nodeCount = value;
    		$$invalidate(22, nodeCount);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		JSZip,
    		Panel,
    		ErrorMessage,
    		Footer,
    		File,
    		Images,
    		Page,
    		Preview,
    		Text,
    		errorMessage,
    		errorTimeout,
    		loading,
    		views,
    		fileType,
    		fileTypeOptions,
    		extension,
    		extensionOptions,
    		scale,
    		scaleOptions,
    		syntax,
    		includeResizer,
    		fluid,
    		testingMode,
    		centerHtmlOutput,
    		applyStyleNames,
    		applyHtags,
    		styleTextSegments,
    		includeGoogleFonts,
    		clickableLink,
    		maxWidth,
    		imagePath,
    		altText,
    		customScript,
    		nodeCount,
    		exampleAssets,
    		exampleFile,
    		showVariablesButton,
    		buildConfig,
    		postMessage,
    		onChangeConfig,
    		onSelectExport,
    		onReset,
    		onChangeView,
    		onSaveSettings,
    		setErrorMessage,
    		onLoadSettings,
    		onWriteVariables,
    		buildPreviewImages,
    		buildZipArchive,
    		resizing,
    		resizeWindow,
    		resizeDown,
    		resizeUp,
    		showLoader
    	});

    	$$self.$inject_state = $$props => {
    		if ('errorMessage' in $$props) $$invalidate(6, errorMessage = $$props.errorMessage);
    		if ('errorTimeout' in $$props) errorTimeout = $$props.errorTimeout;
    		if ('loading' in $$props) loading = $$props.loading;
    		if ('views' in $$props) $$invalidate(7, views = $$props.views);
    		if ('fileType' in $$props) $$invalidate(0, fileType = $$props.fileType);
    		if ('fileTypeOptions' in $$props) $$invalidate(1, fileTypeOptions = $$props.fileTypeOptions);
    		if ('extension' in $$props) $$invalidate(2, extension = $$props.extension);
    		if ('extensionOptions' in $$props) $$invalidate(3, extensionOptions = $$props.extensionOptions);
    		if ('scale' in $$props) $$invalidate(4, scale = $$props.scale);
    		if ('scaleOptions' in $$props) $$invalidate(5, scaleOptions = $$props.scaleOptions);
    		if ('syntax' in $$props) $$invalidate(8, syntax = $$props.syntax);
    		if ('includeResizer' in $$props) $$invalidate(9, includeResizer = $$props.includeResizer);
    		if ('fluid' in $$props) $$invalidate(10, fluid = $$props.fluid);
    		if ('testingMode' in $$props) $$invalidate(11, testingMode = $$props.testingMode);
    		if ('centerHtmlOutput' in $$props) $$invalidate(12, centerHtmlOutput = $$props.centerHtmlOutput);
    		if ('applyStyleNames' in $$props) $$invalidate(13, applyStyleNames = $$props.applyStyleNames);
    		if ('applyHtags' in $$props) $$invalidate(14, applyHtags = $$props.applyHtags);
    		if ('styleTextSegments' in $$props) $$invalidate(15, styleTextSegments = $$props.styleTextSegments);
    		if ('includeGoogleFonts' in $$props) $$invalidate(16, includeGoogleFonts = $$props.includeGoogleFonts);
    		if ('clickableLink' in $$props) $$invalidate(17, clickableLink = $$props.clickableLink);
    		if ('maxWidth' in $$props) $$invalidate(18, maxWidth = $$props.maxWidth);
    		if ('imagePath' in $$props) $$invalidate(19, imagePath = $$props.imagePath);
    		if ('altText' in $$props) $$invalidate(20, altText = $$props.altText);
    		if ('customScript' in $$props) $$invalidate(21, customScript = $$props.customScript);
    		if ('nodeCount' in $$props) $$invalidate(22, nodeCount = $$props.nodeCount);
    		if ('exampleAssets' in $$props) $$invalidate(23, exampleAssets = $$props.exampleAssets);
    		if ('exampleFile' in $$props) $$invalidate(24, exampleFile = $$props.exampleFile);
    		if ('showVariablesButton' in $$props) $$invalidate(25, showVariablesButton = $$props.showVariablesButton);
    		if ('resizing' in $$props) resizing = $$props.resizing;
    		if ('showLoader' in $$props) $$invalidate(26, showLoader = $$props.showLoader);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*fileTypeOptions, fileType*/ 3) {
    			{
    				fileTypeOptions.forEach((o, i) => {
    					$$invalidate(1, fileTypeOptions[i].selected = o.value === fileType, fileTypeOptions);
    				});
    			}
    		}

    		if ($$self.$$.dirty[0] & /*extensionOptions, extension*/ 12) {
    			{
    				extensionOptions.forEach((o, i) => {
    					$$invalidate(3, extensionOptions[i].selected = o.value === extension, extensionOptions);
    				});
    			}
    		}

    		if ($$self.$$.dirty[0] & /*scaleOptions, scale*/ 48) {
    			{
    				scaleOptions.forEach((o, i) => {
    					$$invalidate(5, scaleOptions[i].selected = o.value === scale, scaleOptions);
    				});
    			}
    		}
    	};

    	$$invalidate(26, showLoader = false);

    	return [
    		fileType,
    		fileTypeOptions,
    		extension,
    		extensionOptions,
    		scale,
    		scaleOptions,
    		errorMessage,
    		views,
    		syntax,
    		includeResizer,
    		fluid,
    		testingMode,
    		centerHtmlOutput,
    		applyStyleNames,
    		applyHtags,
    		styleTextSegments,
    		includeGoogleFonts,
    		clickableLink,
    		maxWidth,
    		imagePath,
    		altText,
    		customScript,
    		nodeCount,
    		exampleAssets,
    		exampleFile,
    		showVariablesButton,
    		showLoader,
    		onChangeConfig,
    		onSelectExport,
    		onReset,
    		onChangeView,
    		onSaveSettings,
    		setErrorMessage,
    		onLoadSettings,
    		onWriteVariables,
    		resizeDown,
    		resizeUp,
    		file_1_fileType_binding,
    		file_1_testingMode_binding,
    		file_1_menuItems_binding,
    		file_1_syntax_binding,
    		file_1_errorMessage_binding,
    		sendError_handler,
    		panel0_expanded_binding,
    		images_scaleOptions_binding,
    		images_scale_binding,
    		images_extensionOptions_binding,
    		images_extension_binding,
    		images_imagePath_binding,
    		images_altText_binding,
    		panel1_expanded_binding,
    		page_includeResizer_binding,
    		page_centerHtmlOutput_binding,
    		page_fluid_binding,
    		page_maxWidth_binding,
    		page_customScript_binding,
    		page_clickableLink_binding,
    		panel2_expanded_binding,
    		text_1_showVariablesButton_binding,
    		text_1_styleTextSegments_binding,
    		text_1_applyStyleNames_binding,
    		text_1_applyHtags_binding,
    		text_1_includeGoogleFonts_binding,
    		panel3_expanded_binding,
    		preview_exampleAssets_binding,
    		preview_exampleFile_binding,
    		preview_scale_binding,
    		preview_showLoader_binding,
    		panel_expanded_binding,
    		footer_nodeCount_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

})();
