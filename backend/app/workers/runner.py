import logging
from concurrent.futures import ThreadPoolExecutor
from typing import Callable, Any
from fastapi import BackgroundTasks
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

# Fallback thread pool for non-Celery standalone mode
_executor = ThreadPoolExecutor(max_workers=4)


def dispatch_job(
    task_fn: Callable[..., Any],
    celery_task: Any,
    job_id: str,
    background_tasks: BackgroundTasks = None,
    *args: Any,
    **kwargs: Any,
) -> None:
    """
    Dispatches a job to Celery worker if USE_CELERY is enabled,
    otherwise executes in FastAPI BackgroundTasks / threadpool.
    """
    if settings.USE_CELERY:
        try:
            logger.info(f"Enqueuing task for job {job_id} to Celery")
            celery_task.delay(job_id, *args, **kwargs)
            return
        except Exception as e:
            logger.warning(f"Failed to enqueue to Celery, falling back to background runner: {e}")

    if background_tasks:
        logger.info(f"Scheduling job {job_id} via FastAPI BackgroundTasks")
        background_tasks.add_task(task_fn, job_id, *args, **kwargs)
    else:
        logger.info(f"Executing job {job_id} via thread pool")
        _executor.submit(task_fn, job_id, *args, **kwargs)
