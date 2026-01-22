CREATE TABLE IF NOT EXISTS public.users
(
    id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    full_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    email character varying(100) COLLATE pg_catalog."default" NOT NULL,
    password character varying(50) COLLATE pg_catalog."default" NOT NULL,
    role character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'user'::character varying,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT role_check CHECK (role::text = ANY (ARRAY['user'::character varying, 'admin'::character varying]::text[]))
)

CREATE TABLE IF NOT EXISTS public.sports
(
    id integer NOT NULL DEFAULT nextval('sports_id_seq'::regclass),
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    image_url character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT sports_pkey PRIMARY KEY (id)
)

CREATE TABLE IF NOT EXISTS public.courts
(
    id integer NOT NULL DEFAULT nextval('courts_id_seq'::regclass),
    image_url character varying(255) COLLATE pg_catalog."default",
    court_type character varying(20) COLLATE pg_catalog."default" NOT NULL,
    price numeric NOT NULL,
    sport_id integer NOT NULL,
    is_disabled boolean NOT NULL DEFAULT false,
    "number" integer NOT NULL,
    CONSTRAINT courts_pkey PRIMARY KEY (id),
    CONSTRAINT courts_sport_id_fkey FOREIGN KEY (sport_id)
        REFERENCES public.sports (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT court_type_check CHECK (court_type::text = ANY (ARRAY['indoor'::character varying, 'outdoor'::character varying]::text[])) NOT VALID
)

CREATE TABLE IF NOT EXISTS public.time_slots
(
    id integer NOT NULL DEFAULT nextval('time_slots_id_seq'::regclass),
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    court_id integer NOT NULL,
    CONSTRAINT time_slots_pkey PRIMARY KEY (id),
    CONSTRAINT time_slots_court_id_fkey FOREIGN KEY (court_id)
        REFERENCES public.courts (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT time_slot_time_check CHECK (start_time < end_time) NOT VALID
)

CREATE TABLE IF NOT EXISTS public.bookings
(
    id integer NOT NULL DEFAULT nextval('bookings_id_seq'::regclass),
    booking_date date NOT NULL,
    user_id integer NOT NULL,
    court_id integer NOT NULL,
    time_slot_id integer NOT NULL,
    booking_price numeric,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT bookings_pkey PRIMARY KEY (id),
    CONSTRAINT bookings_booking_date_court_id_time_slot_id_key UNIQUE (booking_date, court_id, time_slot_id),
    CONSTRAINT bookings_court_id_fkey FOREIGN KEY (court_id)
        REFERENCES public.courts (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT bookings_time_slot_id_fkey FOREIGN KEY (time_slot_id)
        REFERENCES public.time_slots (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)