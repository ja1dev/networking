# NetLab: the interactive web edition of the study kits (web/).
# Build context is the repo root so the content build can read ccna/ and ccnp/.
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /srv
COPY web/requirements.txt web/requirements.txt
RUN pip install -r web/requirements.txt

# Only the markdown and diagrams are needed; the PDFs stay out of the image.
COPY ccna/docs ccna/docs
COPY ccna/images ccna/images
COPY ccnp/docs ccnp/docs
COPY ccnp/images ccnp/images
COPY web web

WORKDIR /srv/web
# Parse the markdown now: a malformed question block fails the build, not the site.
RUN python -m app.build_content

RUN useradd --create-home --uid 1000 netlab && mkdir -p data && chown netlab data
USER netlab

EXPOSE 8000
# Migrations run on every start, so a deploy with a new migration upgrades the
# database before the app serves a request.
CMD ["sh", "-c", "alembic upgrade head && exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips='*'"]
