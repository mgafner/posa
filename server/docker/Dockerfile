FROM elixir:1.3

ENV PHOENIX_VERSION 1.2.0

RUN mix local.hex --force && \
    mix local.rebar --force

WORKDIR /usr/src/app
ENV MIX_ENV prod

RUN mix archive.install --force https://github.com/phoenixframework/archives/raw/master/phoenix_new-$PHOENIX_VERSION.ez
COPY mix.* /usr/src/app/
RUN mix deps.get --only prod
RUN mix deps.compile --only prod
COPY . /usr/src/app/
RUN mix compile

CMD mix ecto.migrate && mix phoenix.server
